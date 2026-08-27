# Top-Level Bin Directory

## `dev` Command

The `dev` command is a helper for using docker compose.

For example, you can run a sql script via

```bash
dev sqlcmd -i ./data/funding_submission_lines.sql
```

assuming the file is located at `/db/data/funding_submission_lines.sql`

Note that the `dev` command uses the `db` service, and so only has access to folders under the top-level `db` directory.

## Temporary deployments

`bin/deploy temporary` builds the selected immutable commit and provisions a
disposable public Azure Container Apps environment.

```bash
bin/deploy temporary --pr 51 --ttl-hours 4
bin/deploy temporary --branch feature/example --ttl-hours 4
bin/deploy temporary --git-hash 0123456789abcdef0123456789abcdef01234567
bin/deploy temporary status --pr 51
bin/deploy temporary logs --pr 51 --follow
bin/deploy temporary down --pr 51
bin/deploy temporary down --all --expired --yes
```

`bin/deploy ephemeral` is an alias for `bin/deploy temporary`. The environment
URL is `https://tk-temporary-<source>.<TEMPORARY_DEPLOYMENT_DOMAIN_SUFFIX>`. Each
deployment has isolated SQL Server, Redis, MailDev, and blob storage.

State is stored in `TEMPORARY_DEPLOYMENT_STATE_DIRECTORY` (default:
`~/.traditional-knowledge-temporary`) so failed cleanup can be retried. TTL is
recorded; there is no background scheduler.

Before use, configure these local-only `TEMPORARY_DEPLOYMENT_*` variables:

- `TEMPORARY_DEPLOYMENT_RESOURCE_GROUP`, `TEMPORARY_DEPLOYMENT_CONTAINER_APPS_ENVIRONMENT`,
  `TEMPORARY_DEPLOYMENT_CONTAINER_REGISTRY_SERVER`, `TEMPORARY_DEPLOYMENT_AZURE_SUBSCRIPTION_ID`
- `TEMPORARY_DEPLOYMENT_DOMAIN_SUFFIX`, with an ACA custom-domain suffix and wildcard
  certificate
- `TEMPORARY_DEPLOYMENT_STORAGE_ACCOUNT`, `TEMPORARY_DEPLOYMENT_BLOB_CONNECTION_STRING`,
  `TEMPORARY_DEPLOYMENT_BLOB_CONTAINER`
- `TEMPORARY_DEPLOYMENT_AUTH0_MANAGEMENT_TOKEN`,
  `TEMPORARY_DEPLOYMENT_AUTH0_ALLOWED_HOST_SUFFIX`

The command defaults to the shared UAT Auth0 domain, audience, and client ID.
Set the `TEMPORARY_DEPLOYMENT_AUTH0_*` overrides only when using another compatible
Auth0 application.

Use the `artzzpr-sub` subscription (or its ID), not `wrpzzpr-sub`. The command
resolves the configured subscription before Azure REST calls. A developer with
an eligible Azure role can use PIM self-activation; CI should use an
OIDC/service-principal identity with scoped write access.

Configure the Auth0 application with these wildcard values, replacing
`<suffix>` with `TEMPORARY_DEPLOYMENT_DOMAIN_SUFFIX`:

```text
Allowed Callback URLs: https://*.<suffix>/callback
Allowed Logout URLs:   https://*.<suffix>
Allowed Web Origins:    https://*.<suffix>
```

The resource group, ACA environment, storage account, and ACR must all carry
`traditional-knowledge-temporary=true`. Do not use production credentials or
resources.

### GitHub Actions

The CLI is workflow-safe without a repository-specific action. Authenticate
Azure with OIDC and grant the workflow identity scoped access to the temporary
resource group; do not rely on interactive PIM in CI:

```yaml
permissions:
  contents: read
  id-token: write

env:
  TEMPORARY_DEPLOYMENT_RESOURCE_GROUP: ${{ vars.TEMPORARY_DEPLOYMENT_RESOURCE_GROUP }}
  TEMPORARY_DEPLOYMENT_CONTAINER_APPS_ENVIRONMENT: ${{ vars.TEMPORARY_DEPLOYMENT_CONTAINER_APPS_ENVIRONMENT }}
  TEMPORARY_DEPLOYMENT_CONTAINER_REGISTRY_SERVER: ${{ vars.TEMPORARY_DEPLOYMENT_CONTAINER_REGISTRY_SERVER }}
  TEMPORARY_DEPLOYMENT_AZURE_SUBSCRIPTION_ID: ${{ vars.TEMPORARY_DEPLOYMENT_AZURE_SUBSCRIPTION_ID }}
  TEMPORARY_DEPLOYMENT_DOMAIN_SUFFIX: ${{ vars.TEMPORARY_DEPLOYMENT_DOMAIN_SUFFIX }}
  TEMPORARY_DEPLOYMENT_STORAGE_ACCOUNT: ${{ vars.TEMPORARY_DEPLOYMENT_STORAGE_ACCOUNT }}
  TEMPORARY_DEPLOYMENT_BLOB_CONTAINER: ${{ vars.TEMPORARY_DEPLOYMENT_BLOB_CONTAINER }}
  TEMPORARY_DEPLOYMENT_AUTH0_ALLOWED_HOST_SUFFIX: ${{ vars.TEMPORARY_DEPLOYMENT_AUTH0_ALLOWED_HOST_SUFFIX }}
  TEMPORARY_DEPLOYMENT_BLOB_CONNECTION_STRING: ${{ secrets.TEMPORARY_DEPLOYMENT_BLOB_CONNECTION_STRING }}
  TEMPORARY_DEPLOYMENT_AUTH0_MANAGEMENT_TOKEN: ${{ secrets.TEMPORARY_DEPLOYMENT_AUTH0_MANAGEMENT_TOKEN }}
  TEMPORARY_DEPLOYMENT_STATE_DIRECTORY: ${{ runner.temp }}/traditional-knowledge-temporary
  GH_TOKEN: ${{ github.token }}

steps:
  - uses: actions/checkout@v4
  - uses: azure/login@v2
    with:
      client-id: ${{ secrets.TEMPORARY_DEPLOYMENT_AZURE_CLIENT_ID }}
      tenant-id: ${{ secrets.TEMPORARY_DEPLOYMENT_AZURE_TENANT_ID }}
      subscription-id: ${{ vars.TEMPORARY_DEPLOYMENT_AZURE_SUBSCRIPTION_ID }}
  - run: bin/deploy temporary --pr "${{ github.event.pull_request.number }}"
  - if: ${{ always() }}
    run: bin/deploy temporary down --all --yes
```

Use `workflow_dispatch` or a trusted same-repository pull request workflow.
Never expose Azure or Auth0 secrets to untrusted fork code.
