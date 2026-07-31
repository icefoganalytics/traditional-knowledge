#!/usr/bin/env ruby

require "tmpdir"
load File.expand_path("qa", __dir__)

module QaTest
  module_function

  def assert(condition, message)
    raise message unless condition
  end

  def assert_raises(error_class, message)
    yield
    raise "Expected #{error_class}"
  rescue error_class
    nil
  end

  def environment(state_directory, **overrides)
    {
      "TK_QA_RESOURCE_GROUP" => "CapAero_QA",
      "TK_QA_ACA_ENVIRONMENT" => "tk-qa-env",
      "TK_QA_ACR_SERVER" => "qa.azurecr.io",
      "TK_QA_DNS_SUFFIX" => "qa.example.com",
      "TK_QA_STORAGE_ACCOUNT" => "tkqaassets",
      "TK_QA_AUTH0_ALLOWED_HOST_SUFFIX" => ".qa.example.com",
      "TK_QA_AUTH0_DOMAIN" => "https://qa.example.auth0.com",
      "TK_QA_AUTH0_AUDIENCE" => "traditional-knowledge-qa",
      "TK_QA_AUTH0_CLIENT_ID" => "qa-client",
      "TK_QA_AUTH0_MANAGEMENT_TOKEN" => "qa-management-token",
      "TK_QA_BLOB_CONNECTION_STRING" =>
        "DefaultEndpointsProtocol=https;AccountName=tkqaassets;AccountKey=not-used;BlobEndpoint=https://tkqaassets.blob.core.windows.net/",
      "TK_QA_BLOB_CONTAINER" => "tk-qa",
      "TK_QA_STATE_DIR" => state_directory,
      "TK_QA_SUBSCRIPTION_ID" => "qa-subscription"
    }.merge(overrides)
  end

  class Auth0HttpClient
    attr_reader :token

    def get(_uri, token)
      @token = token
      response = Net::HTTPOK.new("1.1", "200", "OK")
      response.instance_variable_set(
        :@body,
        JSON.generate(
          "callbacks" => ["https://*.qa.example.com/callback"],
          "allowed_logout_urls" => ["https://*.qa.example.com"],
          "web_origins" => ["https://*.qa.example.com"]
        )
      )
      response.instance_variable_set(:@read, true)
      response
    end
  end

  class FailingDeleteRunner
    attr_reader :commands

    def initialize
      @commands = []
    end

    def run(*command)
      @commands << command
      return "true\n" if command.include?("tags['traditional-knowledge-qa']")
      if command.include?("properties.customDomainConfiguration.dnsSuffix")
        return "qa.example.com\n"
      end
      if command.include?("--query") && command.include?("id")
        return(
          "/subscriptions/qa/resourceGroups/CapAero_QA/providers/Microsoft.App/managedEnvironments/tk-qa-env\n"
        )
      end
      if command.include?("properties.managedEnvironmentId")
        return(
          "/subscriptions/qa/resourceGroups/CapAero_QA/providers/Microsoft.App/managedEnvironments/tk-qa-env\n"
        )
      end
      if command.include?("containerapp") && command.include?("delete")
        raise TraditionalKnowledgeQa::CommandError.new(
                command,
                "simulated delete failure"
              )
      end

      ""
    end

    def run_with_environment(environment, *command)
      run(*command)
    end
  end

  class PimRunner
    def initialize(eligibilities, roles)
      @eligibilities = eligibilities
      @roles = roles
    end

    def run(*command)
      joined = command.join(" ")
      if command.include?("--query") && command.include?("id")
        return "qa-subscription\n"
      end
      if joined.include?("roleEligibilityScheduleInstances")
        return JSON.generate("value" => @eligibilities)
      end

      role_id = @roles.keys.find { |id| joined.include?(id) }
      if role_id
        return(
          JSON.generate(
            "properties" => {
              "permissions" => @roles.fetch(role_id)
            }
          )
        )
      end

      raise "Unexpected PIM command: #{joined}"
    end
  end
  class BuildRunner
    attr_reader :commands

    def initialize
      @commands = []
    end

    def run(*command)
      @commands << command
      if command.include?("--query") && command.include?("id")
        return "qa-subscription\n"
      end

      ""
    end
  end

  def eligibility(scope, role_id)
    {
      "properties" => {
        "scope" => scope,
        "roleDefinitionId" =>
          "/subscriptions/qa/providers/Microsoft.Authorization/roleDefinitions/#{role_id}",
        "principalId" => "principal",
        "roleEligibilityScheduleId" => "/eligibility/1"
      }
    }
  end

  Dir.mktmpdir("tk-qa-test-") do |state_directory|
    config = TraditionalKnowledgeQa::Config.new(environment(state_directory))
    config.validate!
    auth0_client = Auth0HttpClient.new
    TraditionalKnowledgeQa::Auth0.new(
      config,
      http_client: auth0_client
    ).validate!
    assert(
      auth0_client.token == "qa-management-token",
      "Auth0 preflight must use the management token"
    )
    cleanup_keys = %w[
      TK_QA_RESOURCE_GROUP
      TK_QA_ACA_ENVIRONMENT
      TK_QA_ACR_SERVER
      TK_QA_DNS_SUFFIX
      TK_QA_STORAGE_ACCOUNT
      TK_QA_BLOB_CONNECTION_STRING
      TK_QA_BLOB_CONTAINER
      TK_QA_STATE_DIR
      TK_QA_SUBSCRIPTION_ID
    ]
    TraditionalKnowledgeQa::Config.new(
      environment(state_directory).slice(*cleanup_keys)
    ).validate_cleanup!
    assert(
      config.environment_id(12) == "pr-12",
      "PR environment IDs must be stable"
    )
    assert(config.app_name(12) == "tk-qa-12", "Azure app names must be stable")
    assert(
      config.blob_container(12) == "tk-qa-pr-12",
      "blob containers must be per PR"
    )
    assert_raises(
      TraditionalKnowledgeQa::Error,
      "production-looking resources must be rejected"
    ) do
      TraditionalKnowledgeQa::Config.new(
        environment(state_directory, "TK_QA_RESOURCE_GROUP" => "production")
      ).validate!
    end
    assert_raises(
      TraditionalKnowledgeQa::Error,
      "insecure Auth0 domains must be rejected"
    ) do
      TraditionalKnowledgeQa::Config.new(
        environment(
          state_directory,
          "TK_QA_AUTH0_DOMAIN" => "http://qa.example.auth0.com"
        )
      ).validate!
    end
    assert_raises(
      TraditionalKnowledgeQa::Error,
      "invalid blob names must be rejected"
    ) do
      TraditionalKnowledgeQa::Config.new(
        environment(state_directory, "TK_QA_BLOB_CONTAINER" => "TK-INVALID")
      ).validate!
    end

    subscription_scope = "/subscriptions/qa-subscription"
    resource_group_scope =
      "/subscriptions/qa-subscription/resourceGroups/CapAero_QA"
    insufficient = eligibility(resource_group_scope, "insufficient")
    sufficient = eligibility(subscription_scope, "sufficient")
    runner =
      PimRunner.new(
        [insufficient, sufficient],
        {
          "insufficient" => [
            { "actions" => ["Microsoft.Storage/*"], "notActions" => [] }
          ],
          "sufficient" => [
            {
              "actions" => ["Microsoft.App/containerApps/write"],
              "notActions" => []
            }
          ]
        }
      )
    azure = TraditionalKnowledgeQa::Azure.new(runner, config)
    selected = azure.send(:activation_eligibility)
    assert(
      selected == sufficient,
      "PIM must select an eligible role that grants Container Apps write access"
    )

    insufficient_runner =
      PimRunner.new(
        [insufficient],
        {
          "insufficient" => [
            { "actions" => ["Microsoft.Storage/*"], "notActions" => [] }
          ]
        }
      )
    insufficient_azure =
      TraditionalKnowledgeQa::Azure.new(insufficient_runner, config)
    assert(
      insufficient_azure.send(:activation_eligibility).nil?,
      "PIM must reject eligible roles without Container Apps write access"
    )
    override_config =
      TraditionalKnowledgeQa::Config.new(
        environment(
          state_directory,
          "TK_QA_AUTH0_DOMAIN" => "https://custom.example.auth0.com",
          "TK_QA_AUTH0_AUDIENCE" => "custom-audience",
          "TK_QA_AUTH0_CLIENT_ID" => "custom-client"
        )
      )
    build_runner = BuildRunner.new
    TraditionalKnowledgeQa::Azure.new(
      build_runner,
      override_config
    ).build_image("/tmp/worktree", "qa-pr-12-tag", "a" * 40, ".qa.example.com")
    build_command = build_runner.commands.last
    assert(
      build_command.include?(
        "VITE_QA_AUTH0_DOMAIN=https://custom.example.auth0.com"
      ) && build_command.include?("VITE_QA_AUTH0_AUDIENCE=custom-audience") &&
        build_command.include?("VITE_QA_AUTH0_CLIENT_ID=custom-client"),
      "Auth0 overrides must be passed into the QA web image build"
    )
    deployment =
      TraditionalKnowledgeQa::Azure.new(build_runner, override_config).send(
        :deployment_body,
        pr_number: 12,
        qa_environment_id: "pr-12",
        managed_environment_id: "/managed-environments/qa",
        location: "canadacentral",
        image_tag: "qa-pr-12-tag",
        sha: "a" * 40,
        expires_at: "2026-07-24T00:00:00Z",
        acr_user: "acr-user",
        acr_password: "acr-password",
        db_password: "db-password",
        blob_container: "tk-qa-pr-12",
        blob_connection_string:
          "BlobEndpoint=https://blob.example;SharedAccessSignature=sas"
      )
    web_container =
      deployment
        .fetch("properties")
        .fetch("template")
        .fetch("containers")
        .find { |container| container.fetch("name") == "web" }
    web_environment =
      web_container
        .fetch("env")
        .select do |entry|
          %w[VITE_AUTH0_DOMAIN VITE_AUTH0_AUDIENCE].include?(
            entry.fetch("name")
          )
        end
        .to_h { |entry| [entry.fetch("name"), entry.fetch("value")] }
    assert(
      web_environment["VITE_AUTH0_DOMAIN"] ==
        "https://custom.example.auth0.com" &&
        web_environment["VITE_AUTH0_AUDIENCE"] == "custom-audience",
      "Auth0 overrides must be passed into the QA API runtime"
    )

    application_without_initialization =
      TraditionalKnowledgeQa::Application.allocate
    assert(
      application_without_initialization.send(
        :preserve_existing_resources?,
        { "phase" => "ready" }
      ),
      "ready state must preserve resources"
    )
    assert(
      application_without_initialization.send(
        :preserve_existing_resources?,
        { "preserve_existing_resources" => true }
      ),
      "interrupted update must preserve resources"
    )
    assert(
      !application_without_initialization.send(
        :preserve_existing_resources?,
        { "phase" => "provisioning" }
      ),
      "initial provisioning must not preserve resources"
    )

    store = TraditionalKnowledgeQa::StateStore.new(state_directory)
    store.save(
      "environment_id" => "pr-12",
      "app_name" => "tk-qa-12",
      "pr_number" => 12,
      "sha" => "a" * 40,
      "image_tag" => "qa-pr-12-aaaaaaaaaaaa",
      "blob_container" => "tk-qa-pr-12",
      "public_url" => "https://tk-qa-12.qa.example.com",
      "expires_at" => "2026-07-23T22:00:00Z",
      "resource_group" => "CapAero_QA",
      "aca_environment" => "tk-qa-env",
      "subscription_id" => "qa-subscription",
      "phase" => "ready"
    )
    assert(
      store.find("pr-12").fetch("sha") == "a" * 40,
      "state must persist PR metadata"
    )
    runner = FailingDeleteRunner.new
    application =
      TraditionalKnowledgeQa::Application.new(
        runner:,
        environment: environment(state_directory)
      )
    assert_raises(
      TraditionalKnowledgeQa::Error,
      "cleanup failure must fail the command"
    ) { application.down(12) }
    assert(store.find("pr-12"), "cleanup failure must retain state for retry")
    tampered_state = store.find("pr-12")
    tampered_state["blob_container"] = "tk-qa-pr-999"
    store.save(tampered_state)
    command_count = runner.commands.length
    assert_raises(
      TraditionalKnowledgeQa::Error,
      "unexpected blob containers must be rejected"
    ) { application.down(12) }
    new_commands = runner.commands.drop(command_count)
    assert(
      new_commands.none? { |command| command.include?("delete") },
      "unexpected blob containers must not be deleted"
    )
  end

  puts "QA command checks passed"
end
