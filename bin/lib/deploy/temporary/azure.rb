module TraditionalKnowledgeTemporaryDeployment
  class Azure
    API_VERSION = "2024-03-01"
    ACCESS_API_VERSION = "2020-10-01"
    PERMISSIONS_API_VERSION = "2015-07-01"
    ACCESS_WAIT_TIMEOUT_SECONDS = 420
    ACCESS_WAIT_INTERVAL_SECONDS = 3
    REQUIRED_ACCESS_ACTION = "Microsoft.App/containerApps/write"
    PIM_AZURE_RESOURCE_ROLES_URL =
      "https://entra.microsoft.com/?feature.msaljs=true" \
        "#view/Microsoft_Azure_PIMCommon/ActivationMenuBlade/~/azurerbac/provider/azurerbac"

    def initialize(runner, config)
      @runner = runner
      @config = config
    end

    def subscription_id
      @subscription_id ||=
        begin
          configured_id = @config.subscription_id
          resolved_id =
            @runner.run(
              "az",
              "account",
              "show",
              "--subscription",
              configured_id,
              "--query",
              "id",
              "-o",
              "tsv"
            ).strip
          if resolved_id.empty?
            raise Error,
                  "Azure returned no subscription ID for #{configured_id.inspect}"
          end

          resolved_id
        end
    end

    def validate_environment!
      ensure_access!
      verify_scope_tag(
        "az",
        "group",
        "show",
        "--name",
        @config.resource_group,
        "--subscription",
        subscription_id
      )
      verify_scope_tag(
        "az",
        "containerapp",
        "env",
        "show",
        "--name",
        @config.aca_environment,
        "--resource-group",
        @config.resource_group,
        "--subscription",
        subscription_id
      )
      verify_scope_tag(
        "az",
        "storage",
        "account",
        "show",
        "--name",
        @config.storage_account,
        "--resource-group",
        @config.resource_group,
        "--subscription",
        subscription_id
      )
      verify_scope_tag(
        "az",
        "acr",
        "show",
        "--name",
        @config.acr_name,
        "--subscription",
        subscription_id
      )
      suffix =
        @runner.run(
          "az",
          "containerapp",
          "env",
          "show",
          "--name",
          @config.aca_environment,
          "--resource-group",
          @config.resource_group,
          "--subscription",
          subscription_id,
          "--query",
          "properties.customDomainConfiguration.dnsSuffix",
          "-o",
          "tsv"
        ).strip
      unless suffix == @config.dns_suffix
        raise Error,
              "ACA environment DNS suffix is #{suffix.inspect}; expected #{@config.dns_suffix.inspect}"
      end
    end
    def verify_scope_tag(*command)
      value =
        @runner.run(
          *command,
          "--query",
          "tags['#{@config.scope_tag}']",
          "-o",
          "tsv"
        ).strip
      return if value == "true"

      raise Error,
            "Azure resource is not tagged #{SCOPE_TAG}=true: #{command.join(" ")}"
    end
    def verify_app_scope!(state)
      begin
        verify_scope_tag(
          "az",
          "containerapp",
          "show",
          "--name",
          state.fetch("app_name"),
          "--resource-group",
          state.fetch("resource_group"),
          "--subscription",
          state.fetch("subscription_id")
        )
      rescue CommandError => error
        if error.output.match?(/not found|could not be found|ResourceNotFound/i)
          return
        end

        raise
      end
      managed_environment_id =
        @runner.run(
          "az",
          "containerapp",
          "env",
          "show",
          "--name",
          @config.aca_environment,
          "--resource-group",
          @config.resource_group,
          "--subscription",
          state.fetch("subscription_id"),
          "--query",
          "id",
          "-o",
          "tsv"
        ).strip
      actual_environment_id =
        @runner.run(
          "az",
          "containerapp",
          "show",
          "--name",
          state.fetch("app_name"),
          "--resource-group",
          state.fetch("resource_group"),
          "--subscription",
          state.fetch("subscription_id"),
          "--query",
          "properties.managedEnvironmentId",
          "-o",
          "tsv"
        ).strip
      return if actual_environment_id == managed_environment_id

      raise Error,
            "Refusing to delete an app outside the configured temporary Container Apps environment"
    end

    def build_image(worktree, image_tag, sha, host_suffix)
      @runner.run(
        "az",
        "acr",
        "build",
        "--registry",
        @config.acr_name,
        "--subscription",
        subscription_id,
        "--image",
        "traditional-knowledge:#{image_tag}",
        "--build-arg",
        "RELEASE_TAG=#{image_tag}",
        "--build-arg",
        "GIT_COMMIT_HASH=#{sha}",
        "--build-arg",
        "VITE_TEMPORARY_HOST_SUFFIX=#{host_suffix}",
        "--build-arg",
        "VITE_TEMPORARY_AUTH0_DOMAIN=#{@config.auth0_domain}",
        "--build-arg",
        "VITE_TEMPORARY_AUTH0_AUDIENCE=#{@config.auth0_audience}",
        "--build-arg",
        "VITE_TEMPORARY_AUTH0_CLIENT_ID=#{@config.auth0_client_id}",
        worktree
      )
    end

    def deploy(
      source,
      sha,
      image_tag,
      expires_at,
      provision_blob_container:,
      remove_app_on_failure:
    )
      app_name = @config.app_name(source)
      verify_app_scope!(
        "app_name" => app_name,
        "resource_group" => @config.resource_group,
        "subscription_id" => subscription_id
      )
      acr_credentials =
        JSON.parse(
          @runner.run(
            "az",
            "acr",
            "credential",
            "show",
            "--name",
            @config.acr_name,
            "--subscription",
            subscription_id
          )
        )
      managed_environment_id =
        @runner.run(
          "az",
          "containerapp",
          "env",
          "show",
          "--name",
          @config.aca_environment,
          "--resource-group",
          @config.resource_group,
          "--subscription",
          subscription_id,
          "--query",
          "id",
          "-o",
          "tsv"
        ).strip
      location =
        @runner.run(
          "az",
          "containerapp",
          "env",
          "show",
          "--name",
          @config.aca_environment,
          "--resource-group",
          @config.resource_group,
          "--subscription",
          subscription_id,
          "--query",
          "location",
          "-o",
          "tsv"
        ).strip
      acr_password = acr_credentials.fetch("passwords").first.fetch("value")
      db_password = secure_database_password
      blob_container = @config.blob_container(source)
      blob_created = false
      if provision_blob_container
        create_blob_container(blob_container)
        blob_created = true
      end
      app_put = false
      begin
        blob_connection_string =
          container_sas_connection_string(blob_container, expires_at)
        body =
          deployment_body(
            source:,
            temporary_environment_id: @config.environment_id(source),
            managed_environment_id:,
            location:,
            image_tag:,
            sha:,
            expires_at:,
            acr_user: acr_credentials.fetch("username"),
            acr_password:,
            db_password:,
            blob_container:,
            blob_connection_string:
          )
        put_app(app_name, body)
        app_put = true
        wait_for_provisioning(app_name)
        wait_for_http(@config.public_url(source), app_name, sha)
      rescue StandardError
        if app_put && remove_app_on_failure
          begin
            delete_remote_app(app_name, @config.resource_group, subscription_id)
          rescue Error => cleanup_error
            warn "Container App cleanup failed (state must be retained): #{cleanup_error.message}"
          end
        end
        if blob_created
          begin
            delete_blob_container(blob_container)
          rescue Error => cleanup_error
            warn "Blob container cleanup failed (state must be retained): #{cleanup_error.message}"
          end
        end
        raise
      end
      {
        "environment_id" => @config.environment_id(source),
        "app_name" => app_name,
        "source_kind" => source.kind.to_s,
        "source_value" => source.value,
        "sha" => sha,
        "image_tag" => image_tag,
        "blob_container" => blob_container,
        "public_url" => @config.public_url(source),
        "expires_at" => expires_at,
        "resource_group" => @config.resource_group,
        "aca_environment" => @config.aca_environment,
        "subscription_id" => subscription_id,
        "phase" => "ready",
        "created_at" => Time.now.utc.iso8601
      }
    end

    def delete(state)
      delete_remote_app(
        state.fetch("app_name"),
        state.fetch("resource_group"),
        state.fetch("subscription_id")
      )
      delete_blob_container(state.fetch("blob_container"))
      delete_images_for_source(
        Source.parse(state.fetch("source_kind"), state.fetch("source_value"))
      )
    end

    def delete_images_for_source(source)
      tags =
        JSON.parse(
          @runner.run(
            "az",
            "acr",
            "repository",
            "show-tags",
            "--name",
            @config.acr_name,
            "--repository",
            "traditional-knowledge",
            "--subscription",
            subscription_id,
            "-o",
            "json"
          )
        )
      prefix = "temporary-#{source.identifier}-"
      tags
        .select { |tag| tag.start_with?(prefix) }
        .each { |tag| delete_image(tag) }
    rescue JSON::ParserError => error
      raise Error,
            "Azure returned invalid temporary image tags: #{error.message}"
    end

    def delete_image(image_tag)
      @runner.run(
        "az",
        "acr",
        "repository",
        "delete",
        "--name",
        @config.acr_name,
        "--subscription",
        subscription_id,
        "--image",
        "traditional-knowledge:#{image_tag}",
        "--yes"
      )
    rescue CommandError => error
      raise unless error.output.match?(/not found|does not exist/i)
    end

    def status(state)
      @runner.run(
        "az",
        "containerapp",
        "show",
        "--name",
        state.fetch("app_name"),
        "--resource-group",
        state.fetch("resource_group"),
        "--subscription",
        state.fetch("subscription_id"),
        "--query",
        "properties.provisioningState",
        "-o",
        "tsv"
      ).strip
    end

    def logs(state, follow: false)
      command = [
        "az",
        "containerapp",
        "logs",
        "show",
        "--name",
        state.fetch("app_name"),
        "--resource-group",
        state.fetch("resource_group"),
        "--subscription",
        state.fetch("subscription_id"),
        "--container",
        "web"
      ]
      command << "--follow" if follow
      follow ? @runner.stream(*command) : @runner.run(*command)
    end
  end
end
