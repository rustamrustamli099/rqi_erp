# Secrets Rotation Strategy
**Classification**: CONFIDENTIAL
**Standard**: SOC 2 Type II / NIST 800-53

## 1. Governance Rule
**"No long-lived secrets."**
All credentials used by the system MUST be rotated automatically. Manual rotation is forbidden except during emergency (Incident Response).

## 2. Infrastructure Architecture
- **Secret Store**: HashiCorp Vault / AWS Secrets Manager.
- **Injection**: Secrets injected into containers at runtime (ENV) or mounted as volumes (preferred for certs).
- **CI/CD**: GitHub Actions reads from Vault using OIDC (No static token).

## 3. Rotation Schedule

| Secret Type | Schedule | Methodology |
|:---|:---|:---|
| **Database Passwords** | Every 30 Days | Blue/Green (Create New User -> Switch App -> Drop Old) |
| **API Keys (Stripe/SendGrid)** | Every 90 Days | Dual-Key Support (Add New -> Update App -> Remove Old) |
| **JWT Signing Private Key** | Every 30 Days | Key Rotation (Allow verification with old key for 24h) |
| **SSH Keys (Bastion)** | Ephemeral (1h) | Signed CA Certificates (No static keys) |

## 4. Automation Workflow (DB Example)
1. **Trigger**: Scheduled Lambda / Cron.
2. **Action**:
   - Generate new random password (32 chars).
   - Create new DB User `app_v2`.
   - Update Secret in Vault.
   - Trigger App Redeploy (Zero Trust) to pick up new creds.
   - Verify App Health.
   - Drop old DB User `app_v1`.
3. **Audit**: Log rotation event to Security SIEM.

## 5. Emergency Rotation
Runbook: `ops/runbooks/disaster-recovery.md` (Scenario C).
Execution time: < 15 minutes.
