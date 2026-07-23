# Top-Level Bin Directory

## `dev` Command

The `dev` command is a helper for using docker compose.

For example, you can run a sql script via

```bash
dev sqlcmd -i ./data/funding_submission_lines.sql
```

assuming the file is located at `/db/data/funding_submission_lines.sql`

Note that the `dev` command uses the `db` service, and so only has access to folders under the top-level `db` directory.

## `qa` Command

Run the offline lifecycle checks through the normal wrapper:

```bash
bin/dev test qa
```
`bin/qa` creates a disposable Azure Container Apps environment from a pull request:

```bash
bin/qa up --pr 50 --ttl-hours 4
bin/qa status --pr 50
bin/qa logs --pr 50 --follow
bin/qa down --pr 50
```

The command builds an immutable PR SHA in a detached worktree, publishes a uniquely tagged image, creates an isolated SQL Server/Redis/MailDev application, and stores retryable state in `~/.traditional-knowledge-qa`. `bin/qa down --all --yes` is intentionally explicit. TTL is recorded for cleanup; it is not a scheduler.

Before use, configure these local-only `TK_QA_*` variables:

- `TK_QA_RESOURCE_GROUP`, `TK_QA_ACA_ENVIRONMENT`, `TK_QA_ACR_SERVER`, `TK_QA_SUBSCRIPTION_ID`
- `TK_QA_DNS_SUFFIX`, with an ACA custom-domain suffix and wildcard certificate
- `TK_QA_STORAGE_ACCOUNT`, `TK_QA_BLOB_CONNECTION_STRING`, `TK_QA_BLOB_CONTAINER`
- `TK_QA_AUTH0_DOMAIN`, `TK_QA_AUTH0_AUDIENCE`, `TK_QA_AUTH0_CLIENT_ID`, `TK_QA_AUTH0_MANAGEMENT_TOKEN`
- `TK_QA_AUTH0_ALLOWED_HOST_SUFFIX`, exactly `.<TK_QA_DNS_SUFFIX>`
Configure the QA Auth0 application with these exact wildcard values, replacing `<suffix>` with `TK_QA_DNS_SUFFIX`:

```text
Allowed Callback URLs: https://*.<suffix>/callback
Allowed Logout URLs:   https://*.<suffix>
Allowed Web Origins:   https://*.<suffix>
```

The command refuses to provision unless `TK_QA_AUTH0_ALLOWED_HOST_SUFFIX` is `.<suffix>`. Existing production and UAT Auth0 entries must remain unchanged.
`TK_QA_AUTH0_MANAGEMENT_TOKEN` must be a short-lived, local-only token with only `read:clients` scope. The command uses it only for the Auth0 preflight, never writes it to state, passes it to Azure, or includes it in error output.

The resource group, ACA environment, storage account, and ACR must all carry the exact tag `traditional-knowledge-qa=true`. The blob connection string must belong to `TK_QA_STORAGE_ACCOUNT`; each PR receives a separate container and short-lived container SAS. Do not use production credentials or resources. `TK_QA_STATE_DIR`, `TK_QA_TIMEOUT_SECONDS`, and `TK_QA_HTTP_TIMEOUT_SECONDS` are optional overrides.

Naming and lifecycle contracts:

- The branch is fetched through `refs/pull/<number>/head` and verified against GitHub’s `headSha`; the detached worktree is removed after the ACR build.
- The image is `traditional-knowledge:qa-pr-<number>-<sha12>`, the ACA app is `tk-qa-<number>`, the environment ID is `pr-<number>`, and the blob container is `<prefix>-pr-<number>`.
- Re-running `bin/qa up --pr <number>` updates that PR’s app to the current SHA, renews its container SAS, and removes the previous SHA image after the new revision is ready.
- Each ACA app runs one replica with SQL Server at `1 CPU/2 GiB`, the web container at `0.5 CPU/1 GiB`, and Redis/MailDev sidecars at `0.25 CPU/0.5 GiB` each. These limits are intentionally conservative defaults and should be tuned only with observed capacity needs.
- The operator who starts an environment is responsible for running `bin/qa down` before the recorded TTL. There is no automatic expiry worker yet. Failed app, blob, or image cleanup retains local state and returns non-zero so the operator can retry.
