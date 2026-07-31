module TraditionalKnowledgeTemporaryDeployment
  class Azure
    private

    def put_app(app_name, body)
      Tempfile.create(%w[tk-temporary- .json]) do |file|
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
        raise Error, "TK_TEMPORARY_BLOB_CONNECTION_STRING has no BlobEndpoint"
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
      uri = URI("#{url}/_status")
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
        if response.is_a?(Net::HTTPSuccess) &&
             payload["GIT_COMMIT_HASH"] == expected_sha
          return
        end
        if Time.now >= deadline
          raise Error,
                "Timed out waiting for #{url}/_status; inspect with `az containerapp logs show --name #{app_name} --resource-group #{@config.resource_group} --container web`"
        end

        sleep 5
      rescue StandardError => error
        raise error if error.is_a?(Error)
        if Time.now >= deadline
          raise Error,
                "Timed out waiting for #{url}/_status; inspect with `az containerapp logs show --name #{app_name} --resource-group #{@config.resource_group} --container web`"
        end

        sleep 5
      end
    end
  end
end
