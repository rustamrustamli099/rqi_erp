# Audit Q&A Rehearsal (Mock Interview)

**Auditor**: "Who has standing access to the Production Database permissions?"
**Lead Engineer**: "Nobody. We operate a Zero Standing Privileges model. Access requires a 'Break-Glass' request via our Identity Portal, which grants a 1-hour session via the Bastion host. All sessions are logged."
**Evidence**: `ops/governance/PRODUCTION_ACCESS_POLICY.md`

---

**Auditor**: "How do you ensure developers don't accidentally drop a table in production?"
**Lead Engineer**: "We have a CI Gate (`validate-migration.ts`) that parses SQL migrations. It explicitly searches for destructive keywords like `DROP` or `TRUNCATE`. If found, the pipeline fails immediately unless a specific override flag is set by a Super Admin."
**Evidence**: `ops/scripts/validate-migration.ts`, GitHub Actions Log.

---

**Auditor**: "Show me how you rotate your database credentials."
**Lead Engineer**: "We use a Zero-Downtime Blue/Green rotation strategy. Our automation creates a new DB user, updates the Vault secret, deploys the app to pick up the new credential, and only then drops the old user. This happens every 30 days automatically."
**Evidence**: `ops/governance/SECRETS_ROTATION.md`

---

**Auditor**: "What happens if an attacker steals a Session Token?"
**Lead Engineer**: "Our Access Tokens are short-lived (15 mins). For immediate revocation, we rotate the `JWT_SECRET` or ban the specific user ID in our Redis session store, which forces a global logout for that user/tenant immediately."
**Evidence**: `ops/runbooks/security-simulation.md` (Scenario 1).
