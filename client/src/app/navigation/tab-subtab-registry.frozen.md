# TAB/SUBTAB REGISTRY — FROZEN SPEC

**Version:** 2.0  
**Status:** FROZEN  
**Last Updated:** 2025-12-28

---

## ADMIN PANEL PAGES

### Dashboard
```
Route: /admin/dashboard
Tabs: none (single page)
Permission: system.dashboard.read
```

### Tenants
```
Route: /admin/tenants
Tabs: none
Permission: system.tenants.read
```

### Branches
```
Route: /admin/branches
Tabs: none
Permission: system.branches.read
```

### Users
```
Route: /admin/users
Tabs:
  - users: system.users.users.read
  - curators: system.users.curators.read
Default: first allowed tab
```

### Billing
```
Route: /admin/billing
Tabs:
  - marketplace: system.billing.marketplace.read
  - packages: system.billing.compact_packages.read
  - subscriptions: system.billing.plans.read
  - invoices: system.billing.invoices.read
  - licenses: system.billing.licenses.read
Default: first allowed tab
```

### Approvals
```
Route: /admin/approvals
Tabs:
  - inbox: system.approvals.read
  - history: system.approvals.history.read
Default: inbox
```

### Settings
```
Route: /admin/settings
Tabs:
  - general: system.settings.general.company_profile.read
  - notifications: system.settings.general.notification_engine.read
  - smtp: system.settings.communication.smtp_email.read
  - sms: system.settings.communication.smtp_sms.read
  - security: system.settings.security.security_policy.global_policy.read
  - sso: system.settings.security.sso_OAuth.read
  - roles: system.settings.security.user_rights.role.read
  - dictionaries: system.settings.system_configurations.dictionary.read
    SubTabs:
      - currency: system.settings.system_configurations.dictionary.currency.read
      - tax: system.settings.system_configurations.dictionary.tax.read
      - country: system.settings.system_configurations.dictionary.country.read
  - templates: system.settings.system_configurations.document_templates.read
  - workflow: system.settings.system_configurations.workflow.configuration.read
Default: first allowed tab
```

### System Console
```
Route: /admin/console
Tabs:
  - dashboard: system.system_console.dashboard.read
  - monitoring: system.system_console.monitoring.dashboard.read
  - audit: system.system_console.audit_compliance.read
  - jobs: system.system_console.job_scheduler.read
  - retention: system.system_console.data_retention.read
  - features: system.system_console.feature_flags.read
  - policy: system.system_console.policy_security.read
  - feedback: system.system_console.feedback.read
  - tools: system.system_console.tools.read
Default: first allowed tab
```

### Developer Hub
```
Route: /admin/developer
Tabs:
  - api: system.developer_hub.api_reference.read
  - sdks: system.developer_hub.sdk.read
  - webhooks: system.developer_hub.webhooks.read
  - permissions: system.developer_hub.permission_map.read
Default: first allowed tab
```

---

## TENANT PANEL PAGES

### Dashboard
```
Route: /dashboard
Permission: tenant.dashboard.read
```

### Sales
```
Route: /sales
Permission: tenant.sales.read
```

### Warehouse
```
Route: /warehouse
Permission: tenant.warehouse.read
```

### Settings
```
Route: /settings
Permission: tenant.settings.read
```

---

## SCENARIOS

### Curators-Only User
```
Permissions: [system.users.curators.read]
Expected:
  - Visible pages: Users (only)
  - Landing: /admin/users?tab=curators
  - Hidden: users tab
```

### Console Monitoring-Only User
```
Permissions: [system.system_console.monitoring.dashboard.read]
Expected:
  - Visible pages: System Console (only)
  - Landing: /admin/console?tab=monitoring
  - Hidden: all other console tabs
```

---

**DO NOT MODIFY without architecture approval.**
