# 🔐 Secrets Management Governance

**CRITICAL SECURITY RULE**: 
NO secrets (passwords, keys, tokens) shall EVER be stored in this git repository.

## Authorized Storage Locations
1. **Production**: AWS Secrets Manager / Azure Key Vault / HashiCorp Vault.
2. **CI/CD**: GitHub Actions Secrets / GitLab CI Variables.
3. **Local Dev**: `.env` file (gitignored).

## How to Inject Secrets
- **Docker**: Pass as environment variables from the host or secret manager agent.
- **Runtime**: Application reads `process.env`.

## Audit
- If a secret is committed to git, it is considered **COMPROMISED**.
- Immediate Action:
  1. Revoke the secret.
  2. Rotate the secret.
  3. Scrub git history (BFG Repo-Cleaner).
