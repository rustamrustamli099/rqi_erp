# RBAC Root Cause and Fix

## Problem 1: Settings 403 for Communication/Security Tabs

### Root Cause
SettingsPage used inline `can(PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.READ)` checks.
But registry defines different slugs: `system.settings.communication.smtp_email.read`.
This mismatch caused 403 even when user had permission.

### Fix
Removed all inline `can()` permission checks from SettingsPage TabsContent.
Resolver already filters sidebar - if tab is visible, user is allowed.

---

## Problem 2: Unauthorized Tab Click Causes Flash

### Root Cause
ProtectedRoute was navigating to /access-denied for unauthorized tabs.

### Fix
ProtectedRoute now uses `evaluateRoute()` which returns REDIRECT for recoverable cases.
Direct redirect to first allowed tab, no /access-denied intermediate.

---

## Problem 3: Sub-subTab Sticks on First

### Root Cause
Tab content was not using resolver for subTab rendering.

### Fix
DictionariesTab now uses `getAllowedSubTabs()` from resolver.
Only allowed subTabs are rendered in DOM.

---

## Key Principle

**Visible = Allowed**

If sidebar/tab filter passes (via resolver), user has permission.
No need for secondary inline `can()` checks in content.

---

**STATUS: FIXED ✅**
