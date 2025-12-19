# Security Live Drill Runbook
**Status**: Drill Ready
**Roles**: Incident Commander (IC), Ops Lead, Security Analyst.

---

## Scenario A: Token Leak Suspicion
**Trigger**: AWS GuardDuty or GitGuardian alerts that an active API Key was committed to a public repo.

### 1. Verification (First 5 mins)
- **Security Analyst**: Confirm if the key is valid/active.
- Check logs: `grep "API_KEY_ID" /var/log/nginx/access.log`.

### 2. Containment (Action)
- **Ops Lead**: Rotate the key immediately.
  - Command: `vault kv put secret/api-keys stripe=new_value`
  - Command: `ssh prod "ops/scripts/rotate-secrets.sh"` (Restarts app with new env).
- **IC**: Revoke old key in the 3rd party dashboard (e.g., Stripe, AWS).

### 3. Post-Mortem
- Identify who committed it.
- Force `git filter-branch` or `BFG` to scrub repo history.
- Enforce pre-commit hooks.

---

## Scenario B: Cross-Tenant Access Attempt
**Trigger**: Alert `Unauthorized Cross-Tenant Access` (403 Forbidden on Tenant Guard).

### 1. Investigation
- **Security Analyst**: Inspect Log Context.
  - `User: ID_123 (Tenant A)` tried to access `/api/tenants/TENANT_B/data`.
- Determine intent: Malicious or Bug?

### 2. Mitigation
- If Malicious: **Ban User**.
  - Command: `redis-cli SET "blacklist:user:ID_123" "1"`
  - This immediately kills their session via `AuthGuard`.
- If Bug: **Rollback**.
  - Trigger `Emergency Rollback` workflow.

---

## Scenario C: Critical Production Outage
**Trigger**: Error Rate > 5% or Latency > 2s.

### 1. Assessment
- **Ops Lead**: Check Dashboards. Is it DB, App, or Network?
- If App (Bad Deploy): **Rollback**.
  - Execute `Emergency Rollback` workflow.
  - Time to Mitigation: < 1 min.

### 2. Communication
- **IC**: Post to Status Page: "We are investigating an issue..."
- After Rollback: "Issue resolved. Monitoring stability."
