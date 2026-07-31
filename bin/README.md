# Top-Level Bin Directory

## `dev` Command

The `dev` command is a helper for using docker compose.

For example, you can run a sql script via

```bash
dev sqlcmd -i ./data/funding_submission_lines.sql
```

assuming the file is located at `/db/data/funding_submission_lines.sql`

Note that the `dev` command uses the `db` service, and so only has access to folders under the top-level `db` directory.

## Temporary QA environments

`dev qa` creates and removes a disposable Azure Container Apps environment for
one pull request. It builds the exact PR commit in a detached worktree and
never changes the caller's checkout.

```bash
bin/dev qa up --pr 50 --ttl-hours 4
bin/dev qa status --pr 50
bin/dev qa logs --pr 50 --follow
bin/dev qa down --pr 50
bin/dev qa down --all --expired --yes
```

The environment URL is
`https://tk-qa-<pr>.<TK_QA_DNS_SUFFIX>`. The frontend uses that same origin for
API requests, matching the newer production-style application configuration.
Each environment has isolated SQL Server, Redis, MailDev, and blob storage.
State is stored in `TK_QA_STATE_DIR` (default:
`~/.traditional-knowledge-qa`) so failed cleanup can be retried. TTL is
recorded; `down --all --expired --yes` performs explicit expiry cleanup. There
is no background scheduler.

Before use, configure these local-only `TK_QA_*` variables:

- `TK_QA_RESOURCE_GROUP`, `TK_QA_ACA_ENVIRONMENT`, `TK_QA_ACR_SERVER`,
  `TK_QA_SUBSCRIPTION_ID`
- `TK_QA_DNS_SUFFIX`, with an ACA custom-domain suffix and wildcard certificate
- `TK_QA_STORAGE_ACCOUNT`, `TK_QA_BLOB_CONNECTION_STRING`, `TK_QA_BLOB_CONTAINER`
- `TK_QA_AUTH0_MANAGEMENT_TOKEN`
- `TK_QA_AUTH0_ALLOWED_HOST_SUFFIX`, exactly `.<TK_QA_DNS_SUFFIX>`

The QA command defaults to the shared UAT Auth0 domain, audience, and client
ID. Set `TK_QA_AUTH0_DOMAIN`, `TK_QA_AUTH0_AUDIENCE`, or
`TK_QA_AUTH0_CLIENT_ID` only when using another compatible Auth0 application.

Use the QA subscription (`artzzpr-sub` or its subscription ID), not the WRAP
subscription (`wrpzzpr-sub`). The command resolves a configured subscription
name to its ID before Azure REST calls. A developer with an eligible Azure
role can use the WRAP-style PIM self-activation; CI should instead use an
OIDC/service-principal identity with scoped write access to the QA resources.

Configure the QA Auth0 application with these exact wildcard values, replacing
`<suffix>` with `TK_QA_DNS_SUFFIX`:

```text
Allowed Callback URLs: https://*.<suffix>/callback
Allowed Logout URLs:   https://*.<suffix>
Allowed Web Origins:    https://*.<suffix>
```

The command refuses to provision unless `TK_QA_AUTH0_ALLOWED_HOST_SUFFIX` is
`.<suffix>`. Existing production and UAT Auth0 entries remain unchanged.
`TK_QA_AUTH0_MANAGEMENT_TOKEN` is a short-lived local-only token with only
`read:clients`; it is used only for preflight validation.

The resource group, ACA environment, storage account, and ACR must all carry
`traditional-knowledge-qa=true`. The blob connection string must belong to
`TK_QA_STORAGE_ACCOUNT`; each PR receives a separate container and short-lived
container SAS. Do not use production credentials or resources.

### GitHub Actions

The CLI is workflow-safe without a repository-specific action. Authenticate
Azure with OIDC and grant the workflow identity scoped access to the QA
resource group; do not rely on interactive PIM in CI:

```yaml
permissions:
  contents: read
  id-token: write

env:
  TK_QA_RESOURCE_GROUP: ${{ vars.TK_QA_RESOURCE_GROUP }}
  TK_QA_ACA_ENVIRONMENT: ${{ vars.TK_QA_ACA_ENVIRONMENT }}
  TK_QA_ACR_SERVER: ${{ vars.TK_QA_ACR_SERVER }}
  TK_QA_SUBSCRIPTION_ID: ${{ vars.TK_QA_SUBSCRIPTION_ID }}
  TK_QA_DNS_SUFFIX: ${{ vars.TK_QA_DNS_SUFFIX }}
  TK_QA_STORAGE_ACCOUNT: ${{ vars.TK_QA_STORAGE_ACCOUNT }}
  TK_QA_BLOB_CONTAINER: ${{ vars.TK_QA_BLOB_CONTAINER }}
  TK_QA_AUTH0_DOMAIN: ${{ vars.TK_QA_AUTH0_DOMAIN }}
  TK_QA_AUTH0_AUDIENCE: ${{ vars.TK_QA_AUTH0_AUDIENCE }}
  TK_QA_AUTH0_CLIENT_ID: ${{ vars.TK_QA_AUTH0_CLIENT_ID }}
  TK_QA_AUTH0_ALLOWED_HOST_SUFFIX: ${{ vars.TK_QA_AUTH0_ALLOWED_HOST_SUFFIX }}
  TK_QA_BLOB_CONNECTION_STRING: ${{ secrets.TK_QA_BLOB_CONNECTION_STRING }}
  TK_QA_AUTH0_MANAGEMENT_TOKEN: ${{ secrets.TK_QA_AUTH0_MANAGEMENT_TOKEN }}
  TK_QA_STATE_DIR: ${{ runner.temp }}/traditional-knowledge-qa
  GH_TOKEN: ${{ github.token }}

steps:
  - uses: actions/checkout@v4
  - uses: azure/login@v2
    with:
      client-id: ${{ secrets.TK_QA_AZURE_CLIENT_ID }}
      tenant-id: ${{ secrets.TK_QA_AZURE_TENANT_ID }}
      subscription-id: ${{ vars.TK_QA_SUBSCRIPTION_ID }}
  - run: bin/dev qa up --pr "${{ github.event.pull_request.number }}" --ttl-hours 4
  - if: ${{ always() }}
    run: bin/dev qa down --all --yes

The workflow may use `workflow_dispatch` or `pull_request_target` according to
the repository's trust policy. Never expose Azure or Auth0 secrets to
untrusted fork code.
