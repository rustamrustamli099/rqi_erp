# SOC 2 Type II Evidence Pack
**Audit Period**: Jan 2025 - Dec 2025

## 1. CC: Common Criteria (Security)

### CC 6.1 (Logical Access)
- [ ] **EVIDENCE-001**: List of all users with Production Access. `(Zero - Break Glass Only)`
- [ ] **EVIDENCE-002**: Configuration of Bastion Host & VPN enforcement.
- [ ] **EVIDENCE-003**: Sample "Break-Glass" Ticket & Approval Log.

### CC 6.8 (Software Development)
- [ ] **EVIDENCE-004**: Screenshot of GitHub Branch Protection Rules (Require PR, CI Pass).
- [ ] **EVIDENCE-005**: Sample Pull Request showing "Architecture Test" success.
- [ ] **EVIDENCE-006**: Report of `ops/scripts/validate-migration.ts` blocking a destructive change.

### CC 7.1 (Monitoring)
- [ ] **EVIDENCE-007**: Prometheus Dashboard Screenshot (System Health).
- [ ] **EVIDENCE-008**: Logs showing detected "Unauthorized Access" attempt (403).

### CC 9.1 (Risk Mitigation)
- [ ] **EVIDENCE-009**: Disaster Recovery Test Report (Signed).
- [ ] **EVIDENCE-010**: Screenshot of Vault/Secrets Manager Configuration (Keys created).

## 2. A: Availability
- [ ] **EVIDENCE-011**: Uptime Report (Pingdom/Datadog) showing 99.9%.
- [ ] **EVIDENCE-012**: Backup Configuration (AWS S3 Lifecycle Policy).
