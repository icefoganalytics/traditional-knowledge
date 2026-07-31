module TraditionalKnowledgeTemporaryDeployment
  class Azure
    private

    def deployment_body(
      source:,
      temporary_environment_id:,
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
      host = @config.public_url(source)
      {
        "location" => location,
        "tags" => {
          "traditional-knowledge-temporary" => "true",
          "temporary-environment" => temporary_environment_id,
          "temporary-source-sha" => sha,
          "temporary-expires" => expires_at
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
                  { "name" => "FRONTEND_URL", "value" => host },
                  { "name" => "DB_HOST", "value" => "localhost" },
                  { "name" => "DB_PORT", "value" => "1433" },
                  { "name" => "DB_USERNAME", "value" => "sa" },
                  { "name" => "DB_PASSWORD", "secretRef" => "db-password" },
                  {
                    "name" => "DB_DATABASE",
                    "value" => "traditional_knowledge_temporary"
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
end
