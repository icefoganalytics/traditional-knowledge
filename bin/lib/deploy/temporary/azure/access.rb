module TraditionalKnowledgeTemporaryDeployment
  class Azure
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
            "Activating Traditional Knowledge temporary access for #{@config.resource_group}.",
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
        Azure temporary access is not active for subscription #{subscription_id} and resource group #{@config.resource_group}.
        Activate the eligible role in Azure PIM, then rerun the command:
        #{PIM_AZURE_RESOURCE_ROLES_URL}
      MESSAGE
    end
  end
end
