# SOC 2 Type II - Continuous Monitoring Framework
**Trust Services Criteria**: Security (Common Criteria), Availability, Confidentiality (Opt).
**Review Period**: Continuous / Monthly

## 1. Security (CC) Monitoring

| Control ID | Signal Source | Frequency | Remediation SLA |
|:---|:---|:---|:---|
| **CC6.1** (Access) | AWS IAM / Azure AD Logs for "Break-Glass" usage. | Real-time (Alert) | 24 Hours (Audit Review) |
| **CC6.2** (User Access) | `RoleAssignment` table Audit Logs (via `migrate-roles.ts`). | Weekly Report | 48 Hours |
| **CC6.6** (Boundary) | Nginx Access Logs (403 Spikes > 10/min). | Real-time (Alert) | Immediate (Block IP) |
| **CC6.8** (Software Dev) | GitHub Actions "Failed Migrations" or "Security Regression". | Per Build | Immediate (Block Deploy) |

## 2. Availability (A) Monitoring

| Control ID | Signal Source | Frequency | Remediation SLA |
|:---|:---|:---|:---|
| **A1.2** (Env Events) | Prometheus `/metrics` (CPU > 80%, Error Rate > 1%). | Real-time (Alert) | 4 Hours (RTO) |
| **A1.3** (Backup) | AWS S3 "PutObject" event verification (Daily). | Daily | 24 Hours |
| **A1.4** (Recovery) | DR Drill (Restoration Test). | Quarterly | N/A |

## 3. Confidentiality (C) Monitoring

| Control ID | Signal Source | Frequency | Remediation SLA |
|:---|:---|:---|:---|
| **C1.1** (Data Class) | Sample check of Logs for PII leakage (Regex scan). | Monthly | 48 Hours |
| **C1.2** (Disposal) | Verification of Tenant Data Deletion (Retention Policy). | Monthly | 1 Week |

## 4. Evidence Automation
- **Repo**: `ops/governance/evidence/` (Auto-generated reports).
- **Tool**: Drata / Vanta (Future Integration).
