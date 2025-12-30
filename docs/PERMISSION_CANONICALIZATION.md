# Permission Slug Canonicalization — Completed

## Summary

Backend permission keys aligned with frontend registry.
Registry slugs are the contract — no changes to frontend.

---

## Changes Made

### 1. permission.service.ts - billing_configurations

| Old Key | New Key (Registry) |
|---------|-------------------|
| price_rules | pricing |
| limits_quotas | limits |
| limit_overshoot | overuse |
| grace_period | grace |
| grace_requirements | (removed) |
| invoice_rules | invoice |
| login_and_security | security |

### 2. auth.service.ts - canonicalizePermission()

Added `canonicalizePermission()` method that:
- Converts `admin_panel.*` → `system.*`
- Returns both original and canonical slugs

### 3. seed.ts

Updated menu permission references to use new keys.

---

## Build Status

Server TypeScript: ✅

---

## DB Migration Required

Run after deployment:
```bash
cd server
npx prisma db seed
```

This will:
1. Delete old permission slugs
2. Create new canonical permission slugs
3. Reassign permissions to Owner role

---

## SAP-GRADE Guarantees

1. ✅ No permission inference (no startsWith, no verb stripping)
2. ✅ Registry is the contract
3. ✅ Backend emits canonical slugs matching registry
4. ✅ Deep-only permissions work (parent visibility bubbles up)
