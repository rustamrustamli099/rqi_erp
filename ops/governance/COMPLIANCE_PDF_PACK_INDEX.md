# Compliance PDF Pack - Index
**System**: RQI ERP Enterprise
**Prepared For**: External Auditors / Regulatory Bodies
**Date**: 2025-12-19

---

## 📂 Section 1: Governance & Policy
1. **Production Access Policy**
   - *Ref*: [PRODUCTION_ACCESS_POLICY.md](./PRODUCTION_ACCESS_POLICY.md)
   - *Key Control*: Zero Standing Privileges, Break-Glass Procedure.
2. **Secrets Rotation Strategy**
   - *Ref*: [SECRETS_ROTATION.md](./SECRETS_ROTATION.md)
   - *Key Control*: Automated 30-day rotation, No Secrets in Git.

## 📂 Section 2: Standards & Evidence
3. **ISO 27001 Statement of Applicability (SoA)**
   - *Ref*: [ISO27001_SoA.md](./ISO27001_SoA.md)
   - *Key Control*: Annex A Control Mapping (114 Controls).
4. **SOC 2 Continuous Monitoring**
   - *Ref*: [SOC2_CONTINUOUS_MONITORING.md](./SOC2_CONTINUOUS_MONITORING.md)
   - *Key Control*: Trust Services Criteria (Security, Availability, Confidentiality).

## 📂 Section 3: Operational Readiness
5. **Disaster Recovery Plan**
   - *Ref*: [../runbooks/disaster-recovery.md](../runbooks/disaster-recovery.md)
   - *Key Control*: RPO < 15min, RTO < 4h.
6. **Penetration Test Readiness**
   - *Ref*: [PEN_TEST_READINESS.md](./PEN_TEST_READINESS.md)
   - *Key Control*: Rules of Engagement, Environment Isolation.

---

**Confidentiality Notice**: This document pack contains sensitive security information. Distribution is limited to authorized auditors and regulatory inspectors.
