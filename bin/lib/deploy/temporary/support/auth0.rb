module TraditionalKnowledgeTemporaryDeployment
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
end
