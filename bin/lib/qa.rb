#!/usr/bin/env ruby

require "fileutils"
require "json"
require "net/http"
require "open3"
require "optparse"
require "securerandom"
require "tempfile"
require "tmpdir"
require "time"
require "uri"

module TraditionalKnowledgeQa
  REPOSITORY = "icefoganalytics/traditional-knowledge"
  APP_PREFIX = "tk-qa-"
  SCOPE_TAG = "traditional-knowledge-qa"
  DEFAULT_STATE_DIR = File.expand_path("~/.traditional-knowledge-qa")
  UAT_AUTH0_DOMAIN = "https://yukon-staging.eu.auth0.com"
  UAT_AUTH0_AUDIENCE = "generic-uat"
  UAT_AUTH0_CLIENT_ID = "11878vWk1pmhwyVQwsr2m2zM3w3e912U"

  class Error < StandardError
  end

  class CommandError < Error
    attr_reader :command, :output

    def initialize(command, output)
      @command = command
      @output = output
      super("Command failed (#{command.join(" ")}):\n#{output}")
    end
  end

  class Runner
    def run(*command)
      run_with_environment({}, *command)
    end

    def run_with_environment(environment, *command)
      stdout, stderr, status =
        Open3.capture3(
          { "TK_QA_AUTH0_MANAGEMENT_TOKEN" => nil }.merge(environment),
          *command
        )
      output = [stdout, stderr].reject(&:empty?).join
      raise CommandError.new(command, output) unless status.success?

      stdout
    end
    def stream(*command)
      unless system({ "TK_QA_AUTH0_MANAGEMENT_TOKEN" => nil }, *command)
        raise Error, "Command failed (#{command.join(" ")})"
      end
    end
  end

  class StateStore
    attr_reader :directory

    def initialize(directory = ENV.fetch("TK_QA_STATE_DIR", DEFAULT_STATE_DIR))
      @directory = File.expand_path(directory)
    end

    def save(state)
      FileUtils.mkdir_p(directory, mode: 0o700)
      path = path_for(state.fetch("environment_id"))
      Tempfile.create(%w[qa- .json], directory, mode: 0o600) do |file|
        file.write(JSON.pretty_generate(state))
        file.flush
        File.rename(file.path, path)
      end
    end

    def find(environment_id)
      path = path_for(environment_id)
      return unless File.file?(path)

      JSON.parse(File.read(path))
    rescue JSON::ParserError => error
      raise Error, "Invalid QA state at #{path}: #{error.message}"
    end

    def all
      return [] unless Dir.exist?(directory)

      Dir
        .glob(File.join(directory, "*.json"))
        .sort
        .filter_map do |path|
          JSON.parse(File.read(path))
        rescue JSON::ParserError => error
          raise Error, "Invalid QA state at #{path}: #{error.message}"
        end
    end

    def delete(environment_id)
      File.delete(path_for(environment_id))
    rescue Errno::ENOENT
      nil
    end

    private

    def path_for(environment_id)
      unless environment_id.match?(/\Apr-\d+\z/)
        raise Error, "Invalid environment identifier"
      end

      File.join(directory, "#{environment_id}.json")
    end
  end

  class Config
    REQUIRED = %w[
      TK_QA_RESOURCE_GROUP
      TK_QA_ACA_ENVIRONMENT
      TK_QA_ACR_SERVER
      TK_QA_SUBSCRIPTION_ID
      TK_QA_DNS_SUFFIX
      TK_QA_STORAGE_ACCOUNT
      TK_QA_AUTH0_ALLOWED_HOST_SUFFIX
      TK_QA_AUTH0_MANAGEMENT_TOKEN
      TK_QA_BLOB_CONNECTION_STRING
      TK_QA_BLOB_CONTAINER
    ].freeze

    attr_reader :environment

    def initialize(environment = ENV)
      @environment = environment
    end

    def validate!
      missing = REQUIRED.reject { |key| environment[key].to_s.strip != "" }
      unless missing.empty?
        raise Error, "Missing QA configuration: #{missing.join(", ")}"
      end
      validate_auth0_domain!
      blob_container(1)

      validate_scope!
      unless blob_connection_account == storage_account
        raise Error,
              "TK_QA_BLOB_CONNECTION_STRING must belong to TK_QA_STORAGE_ACCOUNT"
      end
      expected_suffix = ".#{dns_suffix}"
      unless auth0_allowed_host_suffix == expected_suffix
        raise Error,
              "TK_QA_AUTH0_ALLOWED_HOST_SUFFIX must be #{expected_suffix.inspect}"
      end
      self
    end

    def validate_cleanup!
      required = %w[
        TK_QA_RESOURCE_GROUP
        TK_QA_ACA_ENVIRONMENT
        TK_QA_ACR_SERVER
        TK_QA_SUBSCRIPTION_ID
        TK_QA_DNS_SUFFIX
        TK_QA_STORAGE_ACCOUNT
        TK_QA_BLOB_CONNECTION_STRING
        TK_QA_BLOB_CONTAINER
      ]
      missing = required.reject { |key| environment[key].to_s.strip != "" }
      unless missing.empty?
        raise Error, "Missing QA cleanup configuration: #{missing.join(", ")}"
      end

      validate_scope!
      unless blob_connection_account == storage_account
        raise Error,
              "TK_QA_BLOB_CONNECTION_STRING must belong to TK_QA_STORAGE_ACCOUNT"
      end
    end

    def validate_scope!
      unsafe_values = {
        "resource group" => resource_group,
        "ACA environment" => aca_environment,
        "DNS suffix" => dns_suffix,
        "storage account" => storage_account,
        "blob container" => blob_container_prefix
      }
      unsafe =
        unsafe_values.select do |_label, value|
          value.match?(/production|prod(?:uction)?[-_\.]?/i)
        end
      return if unsafe.empty?

      labels = unsafe.keys.join(", ")
      raise Error, "Refusing production-looking QA configuration in #{labels}"
    end

    def resource_group = fetch("TK_QA_RESOURCE_GROUP")
    def aca_environment = fetch("TK_QA_ACA_ENVIRONMENT")
    def acr_server = fetch("TK_QA_ACR_SERVER")
    def acr_name = acr_server.split(".").first
    def dns_suffix =
      fetch("TK_QA_DNS_SUFFIX").sub(%r{\Ahttps?://}, "").sub(%r{/.*\z}, "")
    def scope_tag = SCOPE_TAG
    def storage_account = fetch("TK_QA_STORAGE_ACCOUNT")
    def auth0_allowed_host_suffix = fetch("TK_QA_AUTH0_ALLOWED_HOST_SUFFIX")
    def auth0_domain = environment.fetch("TK_QA_AUTH0_DOMAIN", UAT_AUTH0_DOMAIN)
    def auth0_audience =
      environment.fetch("TK_QA_AUTH0_AUDIENCE", UAT_AUTH0_AUDIENCE)
    def auth0_client_id =
      environment.fetch("TK_QA_AUTH0_CLIENT_ID", UAT_AUTH0_CLIENT_ID)
    def auth0_management_token = fetch("TK_QA_AUTH0_MANAGEMENT_TOKEN")
    def blob_connection_string = fetch("TK_QA_BLOB_CONNECTION_STRING")
    def blob_connection_account =
      blob_connection_string[/AccountName=([^;]+)/i, 1]
    def blob_endpoint = blob_connection_string[/BlobEndpoint=([^;]+)/i, 1]
    def blob_container_prefix = fetch("TK_QA_BLOB_CONTAINER")
    def blob_container(pr_number)
      name = "#{blob_container_prefix}-pr-#{positive_pr_number(pr_number)}"
      unless name.length.between?(3, 63) &&
               name.match?(/\A[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\z/) &&
               !name.include?("--")
        raise Error,
              "QA blob container must be 3–63 lowercase letters, numbers, and single hyphens"
      end

      name
    end
    def repository = environment.fetch("TK_QA_REPOSITORY", REPOSITORY)
    def state_directory =
      environment.fetch("TK_QA_STATE_DIR", DEFAULT_STATE_DIR)
    def subscription_id = fetch("TK_QA_SUBSCRIPTION_ID")
    def timeout_seconds =
      Integer(environment.fetch("TK_QA_TIMEOUT_SECONDS", "300"), 10)
    def http_timeout_seconds =
      Integer(environment.fetch("TK_QA_HTTP_TIMEOUT_SECONDS", "10"), 10)

    def environment_id(pr_number) = "pr-#{positive_pr_number(pr_number)}"
    def app_name(pr_number) = "#{APP_PREFIX}#{positive_pr_number(pr_number)}"
    def public_url(pr_number) = "https://#{app_name(pr_number)}.#{dns_suffix}"

    def state_environment_matches?(state)
      state.fetch("resource_group") == resource_group &&
        state.fetch("aca_environment") == aca_environment
    end

    def positive_pr_number(pr_number)
      value = Integer(pr_number.to_s, 10)
      raise Error, "PR number must be positive" unless value.positive?

      value
    end

    private

    def validate_auth0_domain!
      unless auth0_domain.start_with?("https://")
        raise Error, "TK_QA_AUTH0_DOMAIN must use https://"
      end
    end

    def fetch(key)
      value = environment[key].to_s.strip
      raise Error, "Missing QA configuration: #{key}" if value.empty?

      value
    end
  end

  class GitHub
    def initialize(runner, repository)
      @runner = runner
      @repository = repository
    end
    def pull_request(number)
      result =
        @runner.run(
          "gh",
          "pr",
          "view",
          Integer(number).to_s,
          "--repo",
          @repository,
          "--json",
          "headRefName,headSha"
        )
      JSON.parse(result).transform_keys(&:to_s)
    rescue JSON::ParserError => error
      raise Error, "Unable to read PR metadata: #{error.message}"
    end
    def fetch_commit(number, sha, root)
      ref = "refs/tk-qa/pr-#{Integer(number)}"
      @runner.run(
        "git",
        "-C",
        root,
        "fetch",
        "--force",
        "origin",
        "refs/pull/#{Integer(number)}/head:#{ref}"
      )
      fetched_sha = @runner.run("git", "-C", root, "rev-parse", ref).strip
      if fetched_sha != sha
        begin
          @runner.run("git", "-C", root, "update-ref", "-d", ref)
        rescue StandardError
          nil
        end
        raise Error,
              "Fetched PR commit #{fetched_sha} does not match GitHub SHA #{sha}"
      end

      ref
    end
    def remove_commit_ref(ref, root)
      @runner.run("git", "-C", root, "update-ref", "-d", ref)
    end
  end

  class Auth0
    def initialize(config, http_client: nil)
      @config = config
      @http_client = http_client
    end

    def validate!
      uri =
        URI(
          "#{@config.auth0_domain.sub(%r{/\z}, "")}/api/v2/clients/#{URI.encode_www_form_component(@config.auth0_client_id)}"
        )
      response =
        (
          if @http_client
            @http_client.get(uri, @config.auth0_management_token)
          else
            request(uri)
          end
        )
      unless response.is_a?(Net::HTTPSuccess)
        raise Error,
              "Auth0 UAT client settings could not be read (HTTP #{response.code})"
      end

      settings = JSON.parse(response.body)
      expected_host = "https://*.#{@config.dns_suffix}"
      missing =
        {
          "callbacks" => "#{expected_host}/callback",
          "allowed_logout_urls" => expected_host,
          "web_origins" => expected_host
        }.filter_map do |key, expected|
          "#{key}=#{expected}" unless settings.fetch(key, []).include?(expected)
        end
      return if missing.empty?

      raise Error, "Auth0 UAT client is missing: #{missing.join(", ")}"
    rescue JSON::ParserError => error
      raise Error, "Auth0 client settings were not valid JSON: #{error.message}"
    rescue Timeout::Error, SocketError, Errno::ECONNREFUSED => error
      raise Error, "Auth0 client settings could not be read: #{error.message}"
    end

    private

    def request(uri)
      http_request = Net::HTTP::Get.new(uri)
      http_request["Authorization"] = "Bearer #{@config.auth0_management_token}"
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      http.open_timeout = @config.http_timeout_seconds
      http.read_timeout = @config.http_timeout_seconds
      http.request(http_request)
    end
  end

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
            "Refusing to delete an app outside the configured QA Container Apps environment"
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
        "VITE_QA_HOST_SUFFIX=#{host_suffix}",
        "--build-arg",
        "VITE_QA_AUTH0_DOMAIN=#{@config.auth0_domain}",
        "--build-arg",
        "VITE_QA_AUTH0_AUDIENCE=#{@config.auth0_audience}",
        "--build-arg",
        "VITE_QA_AUTH0_CLIENT_ID=#{@config.auth0_client_id}",
        worktree
      )
    end

    def deploy(
      pr_number,
      sha,
      image_tag,
      expires_at,
      provision_blob_container:,
      remove_app_on_failure:
    )
      app_name = @config.app_name(pr_number)
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
      blob_container = @config.blob_container(pr_number)
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
            pr_number:,
            qa_environment_id: @config.environment_id(pr_number),
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
        wait_for_http(@config.public_url(pr_number), app_name, sha)
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
        "environment_id" => @config.environment_id(pr_number),
        "app_name" => app_name,
        "pr_number" => Integer(pr_number),
        "sha" => sha,
        "image_tag" => image_tag,
        "blob_container" => blob_container,
        "public_url" => @config.public_url(pr_number),
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
      delete_images_for_pr(state.fetch("pr_number"))
    end

    def delete_images_for_pr(pr_number)
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
      prefix = "qa-pr-#{Integer(pr_number)}-"
      tags
        .select { |tag| tag.start_with?(prefix) }
        .each { |tag| delete_image(tag) }
    rescue JSON::ParserError => error
      raise Error, "Azure returned invalid QA image tags: #{error.message}"
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

    private

    def ensure_access!
      return if access_ready?

      eligibility = activation_eligibility
      raise Error, manual_access_message unless eligibility

      @runner.run(
        "az",
        "rest",
        "--method",
        "put",
        "--uri",
        activation_uri(eligibility, SecureRandom.uuid),
        "--body",
        activation_request_body(eligibility)
      )
      wait_for_access
    rescue CommandError, JSON::ParserError, KeyError => error
      raise Error, "#{manual_access_message}\n#{error.message}"
    end

    def access_ready?
      payload =
        JSON.parse(
          @runner.run("az", "rest", "--method", "get", "--uri", permissions_uri)
        )
      permissions = payload.fetch("value", [])
      permissions.any? { |permission| write_access_allowed?(permission) }
    rescue CommandError, JSON::ParserError, KeyError
      false
    end

    def write_access_allowed?(permission)
      allowed =
        permission
          .fetch("actions", [])
          .any? { |pattern| action_matches?(pattern) }
      blocked =
        permission
          .fetch("notActions", [])
          .any? { |pattern| action_matches?(pattern) }
      allowed && !blocked
    end

    def action_matches?(pattern)
      File.fnmatch?(pattern.downcase, REQUIRED_ACCESS_ACTION.downcase)
    end

    def activation_eligibility
      payload =
        JSON.parse(
          @runner.run("az", "rest", "--method", "get", "--uri", eligibility_uri)
        )
      eligibilities =
        payload
          .fetch("value", [])
          .select do |eligibility|
            [preferred_scope, subscription_scope].include?(
              eligibility_scope(eligibility)
            ) && eligible_role_allows_write?(eligibility)
          end
      preferred_matches =
        eligibilities.select do |eligibility|
          eligibility_scope(eligibility) == preferred_scope
        end
      return preferred_matches.first if preferred_matches.one?

      subscription_matches =
        eligibilities.select do |eligibility|
          eligibility_scope(eligibility) == subscription_scope
        end
      return subscription_matches.first if subscription_matches.one?

      eligibilities.first if eligibilities.one?
    end

    def eligible_role_allows_write?(eligibility)
      payload =
        JSON.parse(
          @runner.run(
            "az",
            "rest",
            "--method",
            "get",
            "--uri",
            role_definition_uri(eligibility)
          )
        )
      permissions = payload.fetch("properties").fetch("permissions", [])
      permissions.any? { |permission| write_access_allowed?(permission) }
    end

    def role_definition_uri(eligibility)
      role_definition_id =
        eligibility.fetch("properties").fetch("roleDefinitionId")
      resource_id =
        role_definition_id.delete_prefix("https://management.azure.com")
      resource_id =
        "#{subscription_scope}/providers/Microsoft.Authorization/roleDefinitions/#{resource_id}" unless resource_id.start_with?(
        "/"
      )
      "https://management.azure.com#{resource_id}?api-version=#{ACCESS_API_VERSION}"
    end

    def eligibility_scope(eligibility)
      eligibility.fetch("properties").fetch("scope")
    end

    def activation_uri(eligibility, request_name)
      "https://management.azure.com#{eligibility_scope(eligibility)}/providers/Microsoft.Authorization/" \
        "roleAssignmentScheduleRequests/#{request_name}?api-version=#{ACCESS_API_VERSION}"
    end

    def activation_request_body(eligibility)
      JSON.dump(
        properties: {
          principalId: eligibility.fetch("properties").fetch("principalId"),
          requestType: "SelfActivate",
          roleDefinitionId:
            eligibility.fetch("properties").fetch("roleDefinitionId"),
          linkedRoleEligibilityScheduleId:
            eligibility
              .fetch("properties")
              .fetch("roleEligibilityScheduleId")
              .split("/")
              .last,
          justification:
            "Activating Traditional Knowledge QA access for #{@config.resource_group}.",
          scheduleInfo: {
            startDateTime: Time.now.utc.iso8601,
            expiration: {
              type: "AfterDuration",
              duration: "PT8H"
            }
          }
        }
      )
    end

    def wait_for_access
      deadline = Time.now + ACCESS_WAIT_TIMEOUT_SECONDS
      loop do
        return if access_ready?
        raise Error, manual_access_message if Time.now >= deadline

        sleep ACCESS_WAIT_INTERVAL_SECONDS
      end
    end

    def permissions_uri
      "https://management.azure.com/subscriptions/#{subscription_id}" \
        "/resourceGroups/#{@config.resource_group}/providers/Microsoft.Authorization/permissions" \
        "?api-version=#{PERMISSIONS_API_VERSION}"
    end

    def eligibility_uri
      "https://management.azure.com#{subscription_scope}/providers/Microsoft.Authorization/" \
        "roleEligibilityScheduleInstances?$filter=asTarget()&api-version=#{ACCESS_API_VERSION}"
    end

    def subscription_scope
      "/subscriptions/#{subscription_id}"
    end

    def preferred_scope
      "#{subscription_scope}/resourceGroups/#{@config.resource_group}"
    end

    def manual_access_message
      <<~MESSAGE.chomp
        Azure QA access is not active for subscription #{subscription_id} and resource group #{@config.resource_group}.
        Activate the eligible role in Azure PIM, then rerun the command:
        #{PIM_AZURE_RESOURCE_ROLES_URL}
      MESSAGE
    end

    def put_app(app_name, body)
      Tempfile.create(%w[tk-qa- .json]) do |file|
        file.write(JSON.generate(body))
        file.flush
        url =
          "https://management.azure.com/subscriptions/#{subscription_id}/resourceGroups/#{@config.resource_group}/providers/Microsoft.App/containerApps/#{app_name}?api-version=#{API_VERSION}"
        @runner.run(
          "az",
          "rest",
          "--method",
          "put",
          "--url",
          url,
          "--body",
          "@#{file.path}",
          "--headers",
          "Content-Type=application/json"
        )
      end
    end

    def create_blob_container(name)
      @runner.run_with_environment(
        { "AZURE_STORAGE_CONNECTION_STRING" => @config.blob_connection_string },
        "az",
        "storage",
        "container",
        "create",
        "--name",
        name,
        "--subscription",
        subscription_id,
        "--public-access",
        "off"
      )
    end
    def container_sas_connection_string(name, expires_at)
      sas =
        @runner.run_with_environment(
          {
            "AZURE_STORAGE_CONNECTION_STRING" => @config.blob_connection_string
          },
          "az",
          "storage",
          "container",
          "generate-sas",
          "--name",
          name,
          "--subscription",
          subscription_id,
          "--permissions",
          "racwdl",
          "--expiry",
          expires_at,
          "--https-only",
          "-o",
          "tsv"
        ).strip
      if sas.empty?
        raise Error, "Azure did not return a SAS for blob container #{name}"
      end

      endpoint = @config.blob_endpoint
      if endpoint.to_s.empty?
        raise Error, "TK_QA_BLOB_CONNECTION_STRING has no BlobEndpoint"
      end

      "BlobEndpoint=#{endpoint};SharedAccessSignature=#{sas.delete_prefix("?")}"
    end

    def delete_blob_container(name)
      @runner.run_with_environment(
        { "AZURE_STORAGE_CONNECTION_STRING" => @config.blob_connection_string },
        "az",
        "storage",
        "container",
        "delete",
        "--name",
        name,
        "--subscription",
        subscription_id,
        "--fail-not-exist",
        "false"
      )
    rescue CommandError => error
      raise unless error.output.match?(/not exist|not found/i)
    end

    def delete_remote_app(app_name, resource_group, subscription_id)
      @runner.run(
        "az",
        "containerapp",
        "delete",
        "--name",
        app_name,
        "--resource-group",
        resource_group,
        "--subscription",
        subscription_id,
        "--yes"
      )
    rescue CommandError => error
      unless error.output.match?(
               /not found|could not be found|ResourceNotFound/i
             )
        raise
      end
    end

    def secure_database_password
      [
        SecureRandom.random_number(26) + 65,
        SecureRandom.random_number(26) + 97,
        SecureRandom.random_number(10) + 48,
        [33, 35, 36, 37, 38, 42, 64].sample,
        SecureRandom.alphanumeric(28)
      ].map { |value| value.is_a?(Integer) ? value.chr : value }
        .join
        .chars
        .shuffle
        .join
    end

    def wait_for_provisioning(app_name)
      deadline = Time.now + @config.timeout_seconds
      loop do
        state =
          @runner.run(
            "az",
            "containerapp",
            "show",
            "--name",
            app_name,
            "--resource-group",
            @config.resource_group,
            "--subscription",
            subscription_id,
            "--query",
            "properties.provisioningState",
            "-o",
            "tsv"
          ).strip
        return if state == "Succeeded"
        if state == "Failed"
          raise Error,
                "Azure provisioning failed for #{app_name}; inspect with `az containerapp logs show --name #{app_name} --resource-group #{@config.resource_group} --container web`"
        end
        if Time.now >= deadline
          raise Error,
                "Timed out waiting for Azure provisioning for #{app_name}; inspect with `az containerapp logs show --name #{app_name} --resource-group #{@config.resource_group} --container web`"
        end

        sleep 5
      end
    end

    def wait_for_http(url, app_name, expected_sha)
      deadline = Time.now + @config.timeout_seconds
      uri = URI("#{url}/qa-status")
      loop do
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = uri.scheme == "https"
        http.open_timeout = @config.http_timeout_seconds
        http.read_timeout = @config.http_timeout_seconds
        response = http.get(uri.request_uri)
        payload =
          begin
            JSON.parse(response.body)
          rescue StandardError
            {}
          end
        if response.is_a?(Net::HTTPSuccess) && payload["status"] == "ok" &&
             payload["gitCommitHash"] == expected_sha
          return
        end
        if Time.now >= deadline
          raise Error,
                "Timed out waiting for #{url}/qa-status; inspect with `az containerapp logs show --name #{app_name} --resource-group #{@config.resource_group} --container web`"
        end

        sleep 5
      rescue StandardError => error
        raise error if error.is_a?(Error)
        if Time.now >= deadline
          raise Error,
                "Timed out waiting for #{url}/qa-status; inspect with `az containerapp logs show --name #{app_name} --resource-group #{@config.resource_group} --container web`"
        end

        sleep 5
      end
    end

    def deployment_body(
      pr_number:,
      qa_environment_id:,
      managed_environment_id:,
      location:,
      image_tag:,
      sha:,
      expires_at:,
      acr_user:,
      acr_password:,
      db_password:,
      blob_container:,
      blob_connection_string:
    )
      host = @config.public_url(pr_number)
      {
        "location" => location,
        "tags" => {
          "traditional-knowledge-qa" => "true",
          "qa-environment" => qa_environment_id,
          "qa-pr-sha" => sha,
          "qa-expires" => expires_at
        },
        "properties" => {
          "managedEnvironmentId" => managed_environment_id,
          "configuration" => {
            "activeRevisionsMode" => "Single",
            "ingress" => {
              "external" => true,
              "targetPort" => 3000,
              "transport" => "auto"
            },
            "secrets" => [
              { "name" => "acr-password", "value" => acr_password },
              { "name" => "db-password", "value" => db_password },
              { "name" => "blob-connection", "value" => blob_connection_string }
            ],
            "registries" => [
              {
                "server" => @config.acr_server,
                "username" => acr_user,
                "passwordSecretRef" => "acr-password"
              }
            ]
          },
          "template" => {
            "scale" => {
              "minReplicas" => 1,
              "maxReplicas" => 1
            },
            "containers" => [
              {
                "name" => "db",
                "image" =>
                  "mcr.microsoft.com/mssql/server:2022-CU14-ubuntu-22.04",
                "resources" => {
                  "cpu" => 1.0,
                  "memory" => "2.0Gi"
                },
                "env" => [
                  { "name" => "ACCEPT_EULA", "value" => "Y" },
                  {
                    "name" => "MSSQL_SA_PASSWORD",
                    "secretRef" => "db-password"
                  }
                ]
              },
              {
                "name" => "cache",
                "image" => "bitnamilegacy/redis:8.0.2",
                "resources" => {
                  "cpu" => 0.25,
                  "memory" => "0.5Gi"
                },
                "env" => [
                  { "name" => "ALLOW_EMPTY_PASSWORD", "value" => "yes" }
                ]
              },
              {
                "name" => "mail",
                "image" => "maildev/maildev:2.2.1",
                "resources" => {
                  "cpu" => 0.25,
                  "memory" => "0.5Gi"
                }
              },
              {
                "name" => "web",
                "image" =>
                  "#{@config.acr_server}/traditional-knowledge:#{image_tag}",
                "resources" => {
                  "cpu" => 0.5,
                  "memory" => "1.0Gi"
                },
                "env" => [
                  { "name" => "NODE_ENV", "value" => "production" },
                  { "name" => "QA_ENVIRONMENT", "value" => "true" },
                  { "name" => "FRONTEND_URL", "value" => host },
                  { "name" => "DB_HOST", "value" => "localhost" },
                  { "name" => "DB_PORT", "value" => "1433" },
                  { "name" => "DB_USERNAME", "value" => "sa" },
                  { "name" => "DB_PASSWORD", "secretRef" => "db-password" },
                  {
                    "name" => "DB_DATABASE",
                    "value" => "traditional_knowledge_qa"
                  },
                  {
                    "name" => "DB_TRUST_SERVER_CERTIFICATE",
                    "value" => "true"
                  },
                  {
                    "name" => "REDIS_CONNECTION_URL",
                    "value" => "redis://localhost:6379"
                  },
                  { "name" => "MAIL_HOST", "value" => "localhost" },
                  { "name" => "MAIL_PORT", "value" => "1025" },
                  { "name" => "MAIL_SERVICE", "value" => "MailDev" },
                  {
                    "name" => "BLOB_CONNECTION_STRING",
                    "secretRef" => "blob-connection"
                  },
                  { "name" => "BLOB_CONTAINER", "value" => blob_container },
                  {
                    "name" => "VITE_AUTH0_DOMAIN",
                    "value" => @config.auth0_domain
                  },
                  {
                    "name" => "VITE_AUTH0_AUDIENCE",
                    "value" => @config.auth0_audience
                  }
                ]
              }
            ]
          }
        }
      }
    end
  end

  class Worktree
    def initialize(runner, root)
      @runner = runner
      @root = root
    end

    def with(sha)
      Dir.mktmpdir("tk-qa-build-") do |path|
        @runner.run(
          "git",
          "-C",
          @root,
          "worktree",
          "add",
          "--detach",
          path,
          sha
        )
        begin
          yield path
        ensure
          @runner.run("git", "-C", @root, "worktree", "remove", "--force", path)
        end
      end
    end
  end

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

    def up(pr_number, ttl_hours)
      @config.validate!
      github = GitHub.new(@runner, @config.repository)
      pr = github.pull_request(pr_number)
      sha = pr.fetch("headSha")
      image_tag = "qa-pr-#{Integer(pr_number)}-#{sha[0, 12]}"
      expires_at = (Time.now.utc + ttl_hours * 3600).iso8601
      environment_id = @config.environment_id(pr_number)
      existing_state = @store.find(environment_id)
      preserve_existing_resources = preserve_existing_resources?(existing_state)
      azure = Azure.new(@runner, @config)
      ref = github.fetch_commit(pr_number, sha, @root)
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
          "app_name" => @config.app_name(pr_number),
          "pr_number" => Integer(pr_number),
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
          "blob_container" => @config.blob_container(pr_number),
          "public_url" => @config.public_url(pr_number),
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
            pr_number,
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
        puts "QA environment ready: #{state.fetch("public_url")}"
        puts "Environment: #{state.fetch("environment_id")}  App: #{state.fetch("app_name")}"
        puts "PR: #{state.fetch("pr_number")}  SHA: #{sha}  Expires: #{expires_at}"
        puts "Teardown: bin/qa down --pr #{pr_number}"
      ensure
        github.remove_commit_ref(ref, @root) if ref
      end
    end

    def list
      states = @store.all
      if states.empty?
        puts "No QA environments."
        return
      end
      states.each do |state|
        puts "#{state.fetch("environment_id")} #{state.fetch("public_url")} #{state.fetch("sha")} expires #{state.fetch("expires_at")}"
      end
    end

    def status(pr_number)
      state = scoped_state_for(pr_number)
      puts "#{state.fetch("environment_id")}: #{Azure.new(@runner, @config).status(state)}"
      puts "URL: #{state.fetch("public_url")}"
    end

    def logs(pr_number, follow)
      state = scoped_state_for(pr_number)
      puts Azure.new(@runner, @config).logs(state, follow:)
    end

    private

    def preserve_existing_resources?(state)
      return false unless state

      state["phase"] == "ready" || state["preserve_existing_resources"] == true
    end

    def scoped_state_for(pr_number)
      state = state_for(pr_number)
      @config.validate_cleanup!
      azure = Azure.new(@runner, @config)
      azure.validate_environment!
      safety_check!(state, azure)
      state
    end

    def state_for(pr_number, reconstruct: false)
      state = @store.find(@config.environment_id(pr_number))
      return state if state
      return reconstruct_state(pr_number) if reconstruct

      raise Error, "No QA state for PR #{pr_number}."
    end

    def reconstruct_state(pr_number)
      azure = Azure.new(@runner, @config)
      {
        "environment_id" => @config.environment_id(pr_number),
        "app_name" => @config.app_name(pr_number),
        "pr_number" => Integer(pr_number),
        "blob_container" => @config.blob_container(pr_number),
        "resource_group" => @config.resource_group,
        "aca_environment" => @config.aca_environment,
        "subscription_id" => azure.subscription_id,
        "phase" => "ready"
      }
    end

    def safety_check!(state, azure)
      expected_blob_container = @config.blob_container(state.fetch("pr_number"))
      unless state.fetch("blob_container") == expected_blob_container
        raise Error, "Refusing to delete an unexpected QA blob container"
      end

      unless state.fetch("app_name").start_with?(APP_PREFIX) &&
               @config.state_environment_matches?(state) &&
               state.fetch("subscription_id") == azure.subscription_id
        raise Error,
              "Refusing to delete an environment outside the configured QA scope"
      end

      azure.verify_app_scope!(state)
    end

    public

    def down(pr_number, all: false, expired: false, confirmed: false)
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
          [state_for(pr_number, reconstruct: true)]
        end
      if states.empty?
        puts expired ? "No expired QA environments." : "No QA environments."
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
        raise Error, "#{failures.length} QA environment deletion(s) failed"
      end
    end
  end

  def self.run(argv)
    command = argv.shift
    return puts(help) if command.nil? || %w[help --help -h].include?(command)

    options = {
      ttl_hours: 4,
      follow: false,
      all: false,
      expired: false,
      yes: false
    }
    parser =
      OptionParser.new do |option_parser|
        option_parser.banner =
          "Usage: bin/qa <up|list|status|logs|down> [options]"
        option_parser.on("--pr NUMBER", Integer, "PR number") do |value|
          options[:pr] = value
        end
        option_parser.on(
          "--ttl-hours HOURS",
          Integer,
          "Environment lifetime (default: 4)"
        ) { |value| options[:ttl_hours] = value }
        option_parser.on("--follow", "Follow logs") { options[:follow] = true }
        option_parser.on("--all", "Operate on all tracked environments") do
          options[:all] = true
        end
        option_parser.on(
          "--expired",
          "With --all, operate only on expired environments"
        ) { options[:expired] = true }
        option_parser.on("--yes", "Confirm a destructive --all operation") do
          options[:yes] = true
        end
        option_parser.on("--help", "Show help") do
          puts option_parser
          exit
        end
      end
    parser.parse!(argv)
    raise Error, "Unexpected argument(s): #{argv.join(" ")}" unless argv.empty?

    application = Application.new
    case command
    when "up"
      raise Error, "up requires --pr NUMBER" unless options[:pr]
      unless options[:ttl_hours].positive?
        raise Error, "--ttl-hours must be positive"
      end
      application.up(options[:pr], options[:ttl_hours])
    when "list"
      application.list
    when "status"
      raise Error, "status requires --pr NUMBER" unless options[:pr]
      application.status(options[:pr])
    when "logs"
      raise Error, "logs requires --pr NUMBER" unless options[:pr]
      application.logs(options[:pr], options[:follow])
    when "down"
      unless options[:pr] || options[:all]
        raise Error, "down requires --pr NUMBER or --all"
      end
      application.down(
        options[:pr],
        all: options[:all],
        expired: options[:expired],
        confirmed: options[:yes]
      )
    else
      raise Error, "Unknown command: #{command}"
    end
  rescue OptionParser::ParseError, ArgumentError, Error => error
    warn error.message
    exit 1
  end

  def self.help
    <<~HELP
      Disposable per-PR QA environments for Traditional Knowledge.

      Usage:
        bin/qa up --pr NUMBER [--ttl-hours HOURS]
        bin/qa list
        bin/qa status --pr NUMBER
        bin/qa logs --pr NUMBER [--follow]
        bin/qa down --pr NUMBER
        bin/qa down --all --expired --yes

      `up` requires TK_QA_* configuration for a non-production Azure Container Apps
      environment. See README.md for the required variables and Auth0 wildcard setup.
    HELP
  end
end

TraditionalKnowledgeQa.run(ARGV) if $PROGRAM_NAME == __FILE__
