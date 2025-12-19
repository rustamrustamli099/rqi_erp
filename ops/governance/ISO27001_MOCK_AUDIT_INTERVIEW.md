# ISO 27001 Mock Audit Interview Script
**Auditee**: Head of Engineering / CISO
**Auditor**: External Lead Auditor (Big 4)

---

## Domain 1: Access Control (A.9 / A.5.15)
**Q1 (Auditor):** "How do you ensure that developers cannot access production data directly?"
**A1 (Response):** "We follow a Strict Separation of Duties. Developers have NO direct access to Production DBs or Servers. If access is critical for a P0 incident, they must request 'Break-Glass' access via our Identity Portal. This grants a 1-hour session via a Bastion Host, and the entire session is logged."
**Evidence:** `ops/governance/PRODUCTION_ACCESS_POLICY.md` (Approval Logs).

**Q2 (Auditor):** "Show me the list of users with standing admin privileges."
**A2 (Response):** "There are zero users with standing admin privileges. All privileged access is Just-In-Time (JIT)."
**Evidence:** AWS IAM / Database User List (Empty of human users).

---

## Domain 2: Change Management (A.12.1.2)
**Q3 (Auditor):** "Walk me through a recent change deployment. How was it approved?"
**A3 (Response):** "Every change starts as a Pull Request. It requires: 1) CI Pass (Unit, Lint, Arch Tests), 2) Peer Review Approval. Once merged to `main`, our CD pipeline deploys to Staging. Promotion to Production requires a separate manual approval gate in GitHub Actions."
**Evidence:** `.github/workflows/deploy.yml` (Approval Check), Closed PR #123.

---

## Domain 3: Logging & Monitoring (A.12.4)
**Q4 (Auditor):** "How do you prevent an administrator from deleting audit logs to cover their tracks?"
**A4 (Response):** "Logs are shipped immediately to an immutable storage bucket (S3 Object Lock / CloudWatch Logs) with 'Write-Once-Read-Many' policy. Even Root cannot delete logs before the retention period (365 days) expires."
**Evidence:** S3 Bucket Policy (Screenshot), `app.module.ts` (Logger Config).

---

## Domain 4: Incident Response (A.16.1)
**Q5 (Auditor):** "When was your last security simulation? What was the scenario?"
**A5 (Response):** "We conducted a 'Token Leak' simulation on [Date]. We simulated a developer committing a token to Git. Our scanner detected it in 2 minutes, and we initiated the revocation runbook within 5 minutes."
**Evidence:** `ops/runbooks/security-simulation.md` (Post-Mortem Report).

---

## Domain 5: Disaster Recovery (A.17.1)
**Q6 (Auditor):** "Demonstrate that you can meet your RPO of 15 minutes."
**A6 (Response):** "Our database performs WAL (Write-Ahead Log) archiving every 5 minutes to S3. In a disaster, we restore the last Full Backup and replay WALs up to the point of failure."
**Evidence:** `ops/runbooks/disaster-recovery.md`, RDS Configuration.
