module TraditionalKnowledgeTemporaryDeployment
  class Config
    REQUIRED = %w[
      TK_TEMPORARY_RESOURCE_GROUP
      TK_TEMPORARY_ACA_ENVIRONMENT
      TK_TEMPORARY_ACR_SERVER
      TK_TEMPORARY_SUBSCRIPTION_ID
      TK_TEMPORARY_DNS_SUFFIX
      TK_TEMPORARY_STORAGE_ACCOUNT
      TK_TEMPORARY_AUTH0_ALLOWED_HOST_SUFFIX
      TK_TEMPORARY_AUTH0_MANAGEMENT_TOKEN
      TK_TEMPORARY_BLOB_CONNECTION_STRING
      TK_TEMPORARY_BLOB_CONTAINER
    ].freeze

    attr_reader :environment

    def initialize(environment = ENV)
      @environment = environment
    end

    def validate!
      missing = REQUIRED.reject { |key| environment[key].to_s.strip != "" }
      unless missing.empty?
        raise Error,
              "Missing temporary deployment configuration: #{missing.join(", ")}"
      end
      validate_auth0_domain!
      blob_container(Source.parse(:pr, "1"))

      validate_scope!
      unless blob_connection_account == storage_account
        raise Error,
              "TK_TEMPORARY_BLOB_CONNECTION_STRING must belong to TK_TEMPORARY_STORAGE_ACCOUNT"
      end
      expected_suffix = ".#{dns_suffix}"
      unless auth0_allowed_host_suffix == expected_suffix
        raise Error,
              "TK_TEMPORARY_AUTH0_ALLOWED_HOST_SUFFIX must be #{expected_suffix.inspect}"
      end
      self
    end

    def validate_cleanup!
      required = %w[
        TK_TEMPORARY_RESOURCE_GROUP
        TK_TEMPORARY_ACA_ENVIRONMENT
        TK_TEMPORARY_ACR_SERVER
        TK_TEMPORARY_SUBSCRIPTION_ID
        TK_TEMPORARY_DNS_SUFFIX
        TK_TEMPORARY_STORAGE_ACCOUNT
        TK_TEMPORARY_BLOB_CONNECTION_STRING
        TK_TEMPORARY_BLOB_CONTAINER
      ]
      missing = required.reject { |key| environment[key].to_s.strip != "" }
      unless missing.empty?
        raise Error,
              "Missing temporary deployment cleanup configuration: #{missing.join(", ")}"
      end

      validate_scope!
      unless blob_connection_account == storage_account
        raise Error,
              "TK_TEMPORARY_BLOB_CONNECTION_STRING must belong to TK_TEMPORARY_STORAGE_ACCOUNT"
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
      raise Error,
            "Refusing production-looking temporary configuration in #{labels}"
    end

    def resource_group = fetch("TK_TEMPORARY_RESOURCE_GROUP")
    def aca_environment = fetch("TK_TEMPORARY_ACA_ENVIRONMENT")
    def acr_server = fetch("TK_TEMPORARY_ACR_SERVER")
    def acr_name = acr_server.split(".").first
    def dns_suffix =
      fetch("TK_TEMPORARY_DNS_SUFFIX").sub(%r{\Ahttps?://}, "").sub(
        %r{/.*\z},
        ""
      )
    def scope_tag = SCOPE_TAG
    def storage_account = fetch("TK_TEMPORARY_STORAGE_ACCOUNT")
    def auth0_allowed_host_suffix =
      fetch("TK_TEMPORARY_AUTH0_ALLOWED_HOST_SUFFIX")
    def auth0_domain =
      environment.fetch("TK_TEMPORARY_AUTH0_DOMAIN", UAT_AUTH0_DOMAIN)
    def auth0_audience =
      environment.fetch("TK_TEMPORARY_AUTH0_AUDIENCE", UAT_AUTH0_AUDIENCE)
    def auth0_client_id =
      environment.fetch("TK_TEMPORARY_AUTH0_CLIENT_ID", UAT_AUTH0_CLIENT_ID)
    def auth0_management_token = fetch("TK_TEMPORARY_AUTH0_MANAGEMENT_TOKEN")
    def blob_connection_string = fetch("TK_TEMPORARY_BLOB_CONNECTION_STRING")
    def blob_connection_account =
      blob_connection_string[/AccountName=([^;]+)/i, 1]
    def blob_endpoint = blob_connection_string[/BlobEndpoint=([^;]+)/i, 1]
    def blob_container_prefix = fetch("TK_TEMPORARY_BLOB_CONTAINER")
    def blob_container(source)
      name = "#{blob_container_prefix}-#{source.identifier}"
      unless name.length.between?(3, 63) &&
               name.match?(/\A[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\z/) &&
               !name.include?("--")
        raise Error,
              "Temporary blob containers must be 3–63 lowercase letters, numbers, and single hyphens"
      end

      name
    end
    def repository = environment.fetch("TK_TEMPORARY_REPOSITORY", REPOSITORY)
    def state_directory =
      environment.fetch("TK_TEMPORARY_STATE_DIR", DEFAULT_STATE_DIR)
    def subscription_id = fetch("TK_TEMPORARY_SUBSCRIPTION_ID")
    def timeout_seconds =
      Integer(environment.fetch("TK_TEMPORARY_TIMEOUT_SECONDS", "300"), 10)
    def http_timeout_seconds =
      Integer(environment.fetch("TK_TEMPORARY_HTTP_TIMEOUT_SECONDS", "10"), 10)

    def environment_id(source) = source.identifier
    def app_name(source) = "#{APP_PREFIX}#{source.app_identifier}"
    def public_url(source) = "https://#{app_name(source)}.#{dns_suffix}"

    def state_environment_matches?(state)
      state.fetch("resource_group") == resource_group &&
        state.fetch("aca_environment") == aca_environment
    end

    private

    def validate_auth0_domain!
      unless auth0_domain.start_with?("https://")
        raise Error, "TK_TEMPORARY_AUTH0_DOMAIN must use https://"
      end
    end

    def fetch(key)
      value = environment[key].to_s.strip
      raise Error, "Missing temporary configuration: #{key}" if value.empty?

      value
    end
  end
end
