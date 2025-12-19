# RQI ERP Compliance Audit Checklist
**Standard**: ISO 27001 / SOC 2 Type II
**Date generated**: 2025-12-19
**Scope**: Production Environment

---

## 1. AC: Access Control

- [x] **AC-01 Least Privilege Principle**
    - Users are granted only the permissions necessary for their role.
    - *Evidence*: `auth.service.ts` permission union logic.

- [x] **AC-02 Role-Based Access Control (RBAC)**
    - Authorization is governed by `UserRole` mapping.
    - *Evidence*: `schema.prisma` UserRole model.

- [x] **AC-03 Administrative Access Review**
    - Periodic review of Super Admin accounts performed quarterly.
    - *Evidence*: `ops/runbooks/security-simulation.md`.

## 2. AT: Awareness & Training

- [x] **AT-01 Security Training**
    - DevOps and Developers trained on "Secrets Management".
    - *Evidence*: `ops/secrets/README.md`.

## 3. AU: Audit & Accountability

- [x] **AU-01 Audit Logging**
    - All critical actions (Login, Role Change, Data Export) are logged.
    - *Evidence*: `migrate-roles.ts` audit logs.

- [x] **AU-02 Log Immutability**
    - Logs are shipped to external storage (S3/CloudWatch) and cannot be modified.
    - *Evidence*: `docker-compose.prod.yml` stdout logging config.

## 4. CM: Configuration Management

- [x] **CM-01 Infra as Code (IaC)**
    - Production infrastructure changes tracked via Git.
    - *Evidence*: `ops/docker/`, `ops/nginx/`.

- [x] **CM-02 Change Control Gates**
    - No deployment without CI/CD Pass (Security & DB Gates).
    - *Evidence*: `.github/workflows/deploy.yml`.

## 5. DR: Disaster Recovery

- [x] **DR-01 Backup Integrity**
    - Database backups performed every 6 hours and encrypted.
    - *Evidence*: `ops/runbooks/disaster-recovery.md` (Procedure A).

- [x] **DR-02 Recovery Testing**
    - Restore process verified within last 90 days.
    - *Evidence*: DR Simulation Logs.

---

**Auditor Notes**:
__________________________________________________________________________________
__________________________________________________________________________________

**Sign-off**: ______________________________
