module TraditionalKnowledgeTemporaryDeployment
  class Application
    def initialize(
      runner: Runner.new,
      environment: ENV,
      root: File.expand_path("../..", __dir__)
    )
      @runner = runner
      @config = Config.new(environment)
      @root = root
      @store = StateStore.new(@config.state_directory)
    end

    def up(source, ttl_hours)
      @config.validate!
      github = GitHub.new(@runner, @config.repository)
      sha = github.commit(source)
      image_tag = "temporary-#{source.identifier}-#{sha[0, 12]}"
      expires_at = (Time.now.utc + ttl_hours * 3600).iso8601
      environment_id = @config.environment_id(source)
      existing_state = @store.find(environment_id)
      preserve_existing_resources = preserve_existing_resources?(existing_state)
      azure = Azure.new(@runner, @config)
      ref = github.fetch_commit(source, sha, @root)
      begin
        azure.validate_environment!
        Worktree
          .new(@runner, @root)
          .with(sha) do |worktree|
            puts "Building #{image_tag} from #{sha}..."
            azure.build_image(
              worktree,
              image_tag,
              sha,
              ".#{@config.dns_suffix}"
            )
          end
        @store.save(
          "environment_id" => environment_id,
          "app_name" => @config.app_name(source),
          "source_kind" => source.kind.to_s,
          "source_value" => source.value,
          "sha" => sha,
          "image_tag" => image_tag,
          "previous_image_tag" =>
            (
              if existing_state && existing_state["image_tag"] != image_tag
                existing_state["image_tag"]
              else
                nil
              end
            ),
          "blob_container" => @config.blob_container(source),
          "public_url" => @config.public_url(source),
          "expires_at" => expires_at,
          "resource_group" => @config.resource_group,
          "aca_environment" => @config.aca_environment,
          "subscription_id" => azure.subscription_id,
          "phase" => "provisioning",
          "preserve_existing_resources" => preserve_existing_resources,
          "created_at" => Time.now.utc.iso8601
        )
        state =
          azure.deploy(
            source,
            sha,
            image_tag,
            expires_at,
            provision_blob_container: !preserve_existing_resources,
            remove_app_on_failure: !preserve_existing_resources
          )
        state["previous_image_tag"] = (
          if existing_state && existing_state["image_tag"] != image_tag
            existing_state["image_tag"]
          else
            nil
          end
        )
        state["preserve_existing_resources"] = preserve_existing_resources
        @store.save(state)
        if existing_state && existing_state["image_tag"] != image_tag
          begin
            azure.delete_image(existing_state.fetch("image_tag"))
            state.delete("previous_image_tag")
            @store.save(state)
          rescue Error => error
            warn "Old image retained (cleanup can be retried manually): #{error.message}"
          end
        end
        puts "temporary environment ready: #{state.fetch("public_url")}"
        puts "Environment: #{state.fetch("environment_id")}  App: #{state.fetch("app_name")}"
        puts "Source: #{source.label}  SHA: #{sha}  Expires: #{expires_at}"
        puts "Teardown: bin/deploy temporary down --#{source.kind.to_s.tr("_", "-")} #{source.value}"
      ensure
        github.remove_commit_ref(ref, @root) if ref
      end
    end

    def list
      states = @store.all
      if states.empty?
        puts "No temporary environments."
        return
      end
      states.each do |state|
        puts "#{state.fetch("environment_id")} #{state.fetch("public_url")} #{state.fetch("sha")} expires #{state.fetch("expires_at")}"
      end
    end

    def status(source)
      state = scoped_state_for(source)
      puts "#{state.fetch("environment_id")}: #{Azure.new(@runner, @config).status(state)}"
      puts "URL: #{state.fetch("public_url")}"
    end

    def logs(source, follow)
      state = scoped_state_for(source)
      puts Azure.new(@runner, @config).logs(state, follow:)
    end

    private

    def preserve_existing_resources?(state)
      return false unless state

      state["phase"] == "ready" || state["preserve_existing_resources"] == true
    end

    def scoped_state_for(source)
      state = state_for(source)
      @config.validate_cleanup!
      azure = Azure.new(@runner, @config)
      azure.validate_environment!
      safety_check!(state, azure)
      state
    end

    def state_for(source, reconstruct: false)
      state = @store.find(@config.environment_id(source))
      return state if state
      return reconstruct_state(source) if reconstruct

      raise Error, "No temporary deployment state for #{source.label}."
    end

    def reconstruct_state(source)
      azure = Azure.new(@runner, @config)
      {
        "environment_id" => @config.environment_id(source),
        "app_name" => @config.app_name(source),
        "source_kind" => source.kind.to_s,
        "source_value" => source.value,
        "blob_container" => @config.blob_container(source),
        "resource_group" => @config.resource_group,
        "aca_environment" => @config.aca_environment,
        "subscription_id" => azure.subscription_id,
        "phase" => "ready"
      }
    end

    def safety_check!(state, azure)
      expected_blob_container =
        @config.blob_container(
          Source.parse(state.fetch("source_kind"), state.fetch("source_value"))
        )
      unless state.fetch("blob_container") == expected_blob_container
        raise Error, "Refusing to delete an unexpected temporary blob container"
      end

      unless state.fetch("app_name").start_with?(APP_PREFIX) &&
               @config.state_environment_matches?(state) &&
               state.fetch("subscription_id") == azure.subscription_id
        raise Error,
              "Refusing to delete an environment outside the configured temporary scope"
      end

      azure.verify_app_scope!(state)
    end

    public

    def down(source, all: false, expired: false, confirmed: false)
      raise Error, "down --all requires --yes" if all && !confirmed
      raise Error, "down --expired requires --all" if expired && !all

      @config.validate_cleanup!
      Azure.new(@runner, @config).validate_environment!
      states =
        if all
          all_states = @store.all
          if expired
            all_states.select do |state|
              Time.iso8601(state.fetch("expires_at")) <= Time.now.utc
            end
          else
            all_states
          end
        else
          [state_for(source, reconstruct: true)]
        end
      if states.empty?
        puts(
          if expired
            "No expired temporary environments."
          else
            "No temporary environments."
          end
        )
        return
      end

      failures = []
      states.each do |state|
        azure = Azure.new(@runner, @config)
        begin
          safety_check!(state, azure)
          azure.delete(state)
          @store.delete(state.fetch("environment_id"))
          puts "Deleted #{state.fetch("environment_id")}."
        rescue Error => error
          failures << error
          warn "Could not delete #{state.fetch("environment_id")} (state retained): #{error.message}"
        end
      end
      unless failures.empty?
        raise Error,
              "#{failures.length} temporary environment deletion(s) failed"
      end
    end
  end
end
