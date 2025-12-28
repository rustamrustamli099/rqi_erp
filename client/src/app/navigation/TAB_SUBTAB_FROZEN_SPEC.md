# TAB/SUBTAB FROZEN SPECIFICATION

**Version:** 1.0  
**Status:** FROZEN  
**Last Updated:** 2025-12-28

---

## Overview

This document defines the official tab/subTab structure for the RQI ERP system.
The registry in `tabSubTab.registry.ts` is the **Single Source of Truth**.

---

## Permission Rules

### 1. Normalization
- If user has `create/update/delete/manage` → `read` is **automatically implied**
- Navigation requires **read** action at minimum

### 2. Tab Accessibility
- Tab is accessible if user has **ANY** permission from `requiredAnyOf`
- First accessible tab (in priority order) becomes **landing tab**

### 3. Scope Isolation
- Admin Panel: `system.*` permissions only
- Tenant Panel: `tenant.*` permissions only

---

## Admin Panel Pages

| Page | Path | Tabs |
|------|------|------|
| Dashboard | /admin/dashboard | overview |
| Tenants | /admin/tenants | list |
| Branches | /admin/branches | list |
| Users | /admin/users | users, curators |
| Billing | /admin/billing | marketplace, packages, subscriptions, invoices, licenses |
| Approvals | /admin/approvals | inbox, history |
| Files | /admin/files | files |
| Guide | /admin/guide | guide |
| Settings | /admin/settings | general, notifications, smtp, sms, security, sso, roles, dictionaries, templates, workflow |
| Console | /admin/console | dashboard, monitoring, audit, jobs, retention, features, policy, feedback, tools |
| Developer | /admin/developer | api, sdks, webhooks, permissions |

---

## Edge Cases

### Curators-Only User
```
Permissions: ["system.users.curators.read"]
Result: 
  - Users menu: VISIBLE
  - Landing: /admin/users?tab=curators
```

### Users-Only User
```
Permissions: ["system.users.users.read"]
Result:
  - Users menu: VISIBLE
  - Landing: /admin/users?tab=users
```

---

## Integration Points

1. **Sidebar Visibility:** `canAccessPage(pageKey, perms)`
2. **Route Guard:** `getFirstAllowedTab(pageKey, perms)`
3. **Landing Path:** `buildLandingPath(basePath, tabInfo)`
4. **Preview Engine:** Uses all functions above

---

**DO NOT MODIFY** without architecture review.
