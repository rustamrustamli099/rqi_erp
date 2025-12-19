# ISO 27001 Statement of Applicability (SoA)
**System**: RQI ERP
**Version**: 1.0
**Date**: 2025-12-19

| Annex A Control | Control Description | Applicability | Justification / Implementation | App | Evidence |
|:---|:---|:---|:---|:---|:---|
| **A.5.15** | **Access Control** | ✅ Yes | Rules for access control based on business requirements. | Access Policy, RBAC | `ops/governance/PRODUCTION_ACCESS_POLICY.md` |
| **A.9.1** | **Identity Management** | ✅ Yes | Unique ID for each user, no shared accounts. | Auth Service, Identity Provider | `auth.service.ts` |
| **A.9.2** | **Authentication info** | ✅ Yes | Secure log-on procedures (MFA, Complexity). | MFA Enforcement, Password Policy | `auth.module.ts` |
| **A.9.4** | **Access rights** | ✅ Yes | Restriction of access rights (Least Privilege). | UserRole (Many-to-Many), Permissions | `schema.prisma` |
| **A.10.1** | **Cryptography** | ✅ Yes | Proper use of cryptography (TLS 1.2+, Hashing). | Bcrypt for PW, TLS for Transport | `nginx.conf`, `api.ts` |
| **A.12.1** | **Ops Procedures** | ✅ Yes | Documented operating procedures. | Runbooks for DR and Incidents. | `ops/runbooks/` |
| **A.12.4** | **Logging** | ✅ Yes | Event logging (User actions, Exceptions). | Structured JSON Logging (Pino). | `app.module.ts` |
| **A.14.2** | **Security in Dev** | ✅ Yes | Rules for secure development (CI Gates). | Validated Migrations, Security Tests. | `.github/workflows/deploy.yml` |
| **A.16.1** | **Incident Mgmt** | ✅ Yes | Management of security incidents. | Incident Simulation Guide. | `ops/runbooks/security-simulation.md` |
| **A.17.1** | **Business Verify** | ✅ Yes | Continuity of information security. | Disaster Recovery Plan (RPO/RTO). | `ops/runbooks/disaster-recovery.md` |
| **A.15.1** | **Supplier Rel** | ❌ No | Security in supplier relationships. | No external suppliers with system access. | N/A |

**Approvals:**
- CISO: _____________
- CTO: _____________
