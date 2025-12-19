# External Penetration Test - Readiness Pack
**Status**: Ready for Engagement
**Scope**: Production (Black Box) & Staging (Grey Box)

## 1. Scope (Rules of Engagement)
- **Allowed Targets**:
  - API Endpoints: `https://api.rqi.az/api/v1/*`
  - Authentication Flows: `/auth/login`, `/auth/refresh`
  - Tenant Isolation: Attempting to access Tenant B from Tenant A
- **DISALLOWED**:
  - DDoS / Volumetric Attacks (Nginx Rate Limits are active).
  - Social Engineering of Staff.
  - Physical Intrusion.

## 2. Environment Preparation
- [ ] **WAF Whitelist**: Add Pen-Tester IPs to `nginx/conf.d/whitelist.conf` (if bypass needed).
- [ ] **Test Accounts**:
  - `pentest_admin@rqi.az` (Super Admin) - Expire: 48h
  - `pentest_tenant@rqi.az` (Tenant Owner) - Expire: 48h
- [ ] **Data Masking**:
  - Staging DB is sanitized (No Real PII).
  - Production test is on *isolated* Tenant ID `pentest-tenant-001`.

## 3. Incident Defense (During Test)
**Note to SOC Team**: Do NOT block the IPs listed below during the authorized window.
- **Authorized Source IPs**: `x.x.x.x`, `y.y.y.y`
- **Window**: 2025-12-25 09:00 to 2025-12-27 17:00.

## 4. Evidence Collection
During the test, we will collect:
- Nginx Access Logs (Tagged).
- Application Audit Logs (`AuditService`).
- WAF Block Logs (to verify defensive depth).

## 5. Post-Test Workflow
1. Receive "Vulnerability Report".
2. Triage into **Critical**, **High**, **Medium**, **Low**.
3. Fix Critical/High (SLA: 48h).
4. Re-test (Validation).
