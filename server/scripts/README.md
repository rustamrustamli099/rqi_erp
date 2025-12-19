# Scripts Folder Architecture

## 🚨 IMPORTANT: USAGE RULES

This folder is **APPROVED** for enterprise-grade operations but strictly regulated.
These scripts are for **Maintenance**, **Migration**, and **Seeding** only.

### ✅ ALLOWED
- **One-time migrations** (e.g., Data fixing, schema refactors like `migrate-roles.ts`)
- **Seed / Backfill jobs** (e.g., Initial tenant setup, permission seeding)
- **Manual admin maintenance tasks** (e.g., Cache clearing, token revocation)

### ❌ FORBIDDEN
- **Business Logic** (Must reside in `src/modules/*/application`)
- **Domain Rules** (Must reside in `src/modules/*/domain`)
- **Application Use-Cases** (Do not bypass UseCase layer)
- **Long-running schedulers** (Use `Cron` infrastructure in `src/platform/cron`)
- **API Controllers** (Scripts are not for HTTP handling)

### 🔒 EXECUTION RULES
1. **Explicit Execution Only**: Scripts must never run automatically on start. They must be invoked via `npx ts-node scripts/name.ts` or `npm run script:name`.
2. **Idempotency**: All scripts MUST be safe to run multiple times without corrupting data. Use `upsert`, `findFirst` checks, or transactions.
3. **Auditable**: Script execution should leave a trace (Console Logs stored in CI/CD, or writing to an Audit Log file/table).
4. **Environment Safety**: Scripts modifying production data must require confirmation or explicit flags (e.g., `--dry-run` or `--force`).

### ⚙️ How to Run
```bash
# Example
npx ts-node scripts/migrate-roles.ts
```
