# SOC 2 Evidence Automation Design
**Goal**: Reduce manual audit effort via automated collection.

## 1. Automated Evidence Sources

| Control Domain | Evidence | Automated Source | Collection Frequency |
|:---|:---|:---|:---|
| **Access Control** | Admin User List | `postgres` query -> S3 CSV | Daily |
| **Change Mgmt** | PR Approval + CI Pass | GitHub Actions Archive | Per Build |
| **Vulnerability** | Dependency Audit | `npm audit` log -> S3 | Per Build |
| **Infrastructure** | Terraform State | S3 Versioning | Real-time |
| **Incidents** | Post-Mortem Reports | Jira / Confluence API | Ad-hoc |

## 2. Collection Workflow (Lambda / Script)
1. **Trigger**: Scheduled Event (Daily @ 00:00).
2. **Execute**: `ops/scripts/collect-evidence.sh`.
3. **Action**:
   - Query DB for active `UserRole` assignees.
   - Fetch latest `deploy.yml` run status from GitHub API.
   - Snapshot CloudWatch Metrics (CPU/Memory).
4. **Store**: Save to `s3://rqi-audit-evidence/YYYY-MM-DD/`.
5. **Hash**: Generate `SHA-256` of evidence folder for immutability.

## 3. Auditor Portal
- Auditors are given Read-Only access to the S3 Evidence Bucket.
- Folder structure is strictly dated: `2025/01/01/access-control/users.csv`.
