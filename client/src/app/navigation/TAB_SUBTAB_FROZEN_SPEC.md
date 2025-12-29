# TAB_SUBTAB_FROZEN_SPEC.md
## SAP-Grade Tab/SubTab Registry Specification

---

## 1. Naming & Vocabulary

### Keys
- **pageKey**: Unique identifier for a page (e.g., `admin.users`, `admin.settings`)
- **basePath**: URL path without query params (e.g., `/admin/users`)
- **tabKey**: Identifier for a tab (e.g., `curators`, `dictionaries`)
- **subTabKey**: Identifier for a subTab (e.g., `currency`, `country`)

### Permission Slug Format
```
{scope}.{module}.{resource}.{action}

scope: system | tenant
action: read | create | update | delete | approve | export
```

### Verb Policy
- **Canonical verbs**: `read`, `create`, `update`, `delete`, `approve`, `export`
- **Legacy alias**: `.view` → `.read` (migration only)
- **NO synthetic verbs**: `.access`, `.manage`

---

## 2. URL Contract (Canonical)

### Format
```
/{scope}/{page}?tab={tabKey}&subTab={subTabKey}

Example: /admin/settings?tab=dictionaries&subTab=currency
```

### Rules

| Scenario | Behavior |
|----------|----------|
| **Missing tab** | Redirect to first allowed tab (ONLY allowed redirect) |
| **Unknown tab** | Terminal 403 (access-denied) |
| **Unauthorized tab** | Terminal 403 (NO silent rewrite) |
| **Unknown subTab** | Terminal 403 |
| **Unauthorized subTab** | Terminal 403 |

---

## 3. Registry Schema (TypeScript)

```typescript
interface PageConfig {
    pageKey: string;      // e.g., 'admin.settings'
    basePath: string;     // e.g., '/admin/settings'
    icon?: string;
    tabs: TabConfig[];
}

interface TabConfig {
    key: string;          // e.g., 'dictionaries'
    label: string;        // e.g., 'Soraqçalar'
    requiredAnyOf: string[];  // EXACT permission slugs
    subTabs?: SubTabConfig[];
}

interface SubTabConfig {
    key: string;          // e.g., 'currency'
    label: string;        // e.g., 'Valyuta'
    requiredAnyOf: string[];  // EXACT permission slugs
}
```

---

## 4. Settings Registry Excerpt

```
/admin/settings
├── tab=general         → system.settings.general.read
├── tab=notifications   → system.settings.notifications.read
├── tab=smtp            → system.settings.smtp.read
├── tab=sms             → system.settings.sms.read
├── tab=security        → system.settings.security.read
├── tab=sso             → system.settings.sso.read
├── tab=roles           → system.settings.security.user_rights.role.read
├── tab=billing_config  → system.settings.system_configurations.billing_configurations.read
├── tab=dictionaries
│   ├── subTab=currency → system.settings.system_configurations.dictionary.currency.read
│   ├── subTab=tax      → system.settings.system_configurations.dictionary.tax.read
│   └── subTab=country  → system.settings.system_configurations.dictionary.country.read
├── tab=templates       → system.settings.system_configurations.document_templates.read
└── tab=workflow        → system.settings.system_configurations.workflow.configuration.read
```

---

## 5. Invariants (SAP-Grade)

### Non-Negotiable Rules

| Rule | Description |
|------|-------------|
| **Visible ⇒ Actionable** | If tab is rendered, user CAN access it |
| **No Prefix Inference** | NO `startsWith()` for permissions |
| **No Sibling Leakage** | One tab permission does NOT unlock siblings |
| **Single Resolver** | Same logic for menu, guard, and pages |
| **Terminal 403** | Unauthorized = access-denied, NOT redirect |

### Diagram (ASCII)

```
┌──────────────────────────────────────────────────────┐
│                    AuthZ Resolver                     │
│    (Single Source: TAB_SUBTAB_REGISTRY)              │
├──────────────────────────────────────────────────────┤
│                                                      │
│    ┌─────────────┐    ┌─────────────┐    ┌────────┐ │
│    │   Sidebar   │    │ Protected   │    │  Page  │ │
│    │  Visibility │    │   Route     │    │  Tabs  │ │
│    └──────┬──────┘    └──────┬──────┘    └────┬───┘ │
│           │                  │                 │     │
│           └──────────────────┴─────────────────┘     │
│                              │                       │
│                    ┌─────────▼─────────┐             │
│                    │  allowedTabs[]    │             │
│                    │  allowedSubTabs[] │             │
│                    │  decision: ALLOW  │             │
│                    │           or DENY │             │
│                    └───────────────────┘             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 6. Change Control

### Adding a New Tab
1. Add entry to `TAB_SUBTAB_REGISTRY` in `tabSubTab.registry.ts`
2. Add permission to server seed
3. Run E2E tests
4. Update this spec

### Updating Permission Slugs
1. Update registry AND seed together
2. Run CI prefix scan
3. Run E2E tests
4. Document in changelog

### Test Requirements
- **Unit test**: Permission resolver
- **E2E test**: Unauthorized tab shows 403
- **E2E test**: Unauthorized sibling NOT in DOM

---

**FROZEN: Do not deviate from this specification.**
