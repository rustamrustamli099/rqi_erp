# Server Scripts Governance

This directory contains standalone scripts for administration, migration, and bootstrapping.

## Rules
1. **No Auto-Execution**: These scripts are never run automatically by the application runtime.
2. **Idempotence**: All scripts must be safe to run multiple times without side effects (e.g., check if user exists before creating).
3. **Environment Variables**: Never hardcode credentials. Use `.env`.
4. **Audit**: Scripts should log their actions.

## Available Scripts

### `bootstrap-owner.ts`
Creates the initial System Owner user.
- **Input**: `OWNER_EMAIL`, `OWNER_PASSWORD` (env)
- **Flag**: Sets `isOwner = true`.
- **Permissions**: Implicitly has FULL access (bypasses permission checks).

### `migrate-roles.ts`
Utility to migrate or seed roles/permissions if needed, but NOT for Owner.

### Usage
```bash
npx ts-node scripts/bootstrap-owner.ts
```
