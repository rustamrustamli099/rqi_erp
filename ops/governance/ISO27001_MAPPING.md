# ISO 27001 Annex A Control Mapping
**System**: RQI ERP
**Version**: 1.0

| Annex A Control | Control Objective | Implementation Evidence | Responsible |
|:---|:---|:---|:---|
| **A.5.15 Access Control** | Access based on business reqs (Least Privilege). | `ops/governance/PRODUCTION_ACCESS_POLICY.md`, `schema.prisma` (UserRole). | Admin / CISO |
| **A.8.2 Privileged Access** | Restrict privileged access rights. | `ops/governance/PRODUCTION_ACCESS_POLICY.md` (Bastion, MFA, Break-glass). | Ops |
| **A.8.9 Config Management** | Hardening configurations. | `ops/nginx/nginx.conf` (Headers), `docker-compose.prod.yml`. | DevOps |
| **A.8.24 Crypto Key Mgmt** | Secure key lifecycle. | `ops/governance/SECRETS_ROTATION.md` (Rotation Policy). | Security |
| **A.8.28 Secure Coding** | Principles for secure engineering. | Security Gates (`test/security/regression.spec.ts`), Linting, Arch Tests. | Backend Lead |
| **A.12.1 Operational Procedures** | Documented operating procedures (Runbooks). | `ops/runbooks/disaster-recovery.md`, `ops/runbooks/security-simulation.md`. | Ops |
| **A.12.4 Logging** | Recording of events. | `app.module.ts` (Pino Logger), `ops/runbooks/compliance-checklist.md`. | DevOps |
| **A.14.2 Technical Vulnerabilities** | Automated vulnerability checks. | `.github/workflows/deploy.yml` (Security & DB Gates). | DevOps |
| **A.17.1 Business Continuity** | InfoSec continuity. | `ops/docs/DISASTER_RECOVERY.md` (RPO/RTO). | Ops Lead |
