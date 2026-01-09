/**
 * PHASE 14H: Z_* Page Authorization Objects Registry
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP PFCG-Grade Page Authorization.
 * Every routable page MUST be explicitly registered here.
 * 
 * RULES:
 * 1. Missing Z_* object = HARD DENY (no fallbacks)
 * 2. READ permission (ACTVT=03) controls page access
 * 3. Sections use AND logic (all required permissions must be present)
 * 4. Actions map to GS_* semantic keys
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface PageSection {
    key: string;
    requiredPermissions: string[]; // AND logic - all must be present
}

export interface PageAuthorizationObject {
    /**
     * Z_* Page Key - must match frontend usePageState(pageKey) call
     */
    pageKey: string;

    /**
     * Entity key in ACTION_PERMISSIONS_REGISTRY for action mapping
     */
    entityKey: string;

    /**
     * READ permission required to ACCESS this page
     * If user lacks this permission, authorized = false
     */
    readPermission: string;

    /**
     * Optional sections with visibility rules
     */
    sections?: PageSection[];
}

/**
 * CANONICAL PAGE AUTHORIZATION OBJECTS REGISTRY
 * 
 * ALL routable pages must be registered here.
 * Missing = HARD DENY (SAP T-Code semantics)
 */
export const PAGE_OBJECTS_REGISTRY: PageAuthorizationObject[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // USERS DOMAIN
    // ═══════════════════════════════════════════════════════════════════════
    {
        pageKey: 'Z_USERS',
        entityKey: 'users',
        readPermission: 'system.users.users.read',
    },
    {
        pageKey: 'Z_CURATORS',
        entityKey: 'curators',
        readPermission: 'system.users.curators.read',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TENANTS DOMAIN
    // ═══════════════════════════════════════════════════════════════════════
    {
        pageKey: 'Z_TENANTS',
        entityKey: 'tenants',
        readPermission: 'system.tenants.read',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SETTINGS - GENERAL
    // ═══════════════════════════════════════════════════════════════════════
    {
        pageKey: 'Z_SETTINGS',
        entityKey: 'settings',
        readPermission: 'system.settings.read',
    },
    {
        pageKey: 'Z_SETTINGS_COMPANY_PROFILE',
        entityKey: 'settings_company_profile',
        readPermission: 'system.settings.general.company_profile.read',
    },
    {
        pageKey: 'Z_SETTINGS_NOTIFICATION_ENGINE',
        entityKey: 'settings_notification_engine',
        readPermission: 'system.settings.general.notification_engine.read',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SETTINGS - COMMUNICATION
    // ═══════════════════════════════════════════════════════════════════════
    {
        pageKey: 'Z_SETTINGS_EMAIL',
        entityKey: 'settings_communication_email',
        readPermission: 'system.settings.communication.smtp_email.read',
    },
    {
        pageKey: 'Z_SETTINGS_SMS',
        entityKey: 'settings_communication_sms',
        readPermission: 'system.settings.communication.smtp_sms.read',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SETTINGS - SECURITY
    // ═══════════════════════════════════════════════════════════════════════
    {
        pageKey: 'Z_SETTINGS_SECURITY_PASSWORD',
        entityKey: 'settings_security_password',
        readPermission: 'system.settings.security.security_policy.password.read',
    },
    {
        pageKey: 'Z_SETTINGS_SECURITY_LOGIN',
        entityKey: 'settings_security_login',
        readPermission: 'system.settings.security.security_policy.login.read',
    },
    {
        pageKey: 'Z_SETTINGS_SECURITY_SESSION',
        entityKey: 'settings_security_session',
        readPermission: 'system.settings.security.security_policy.session.read',
    },
    {
        pageKey: 'Z_SETTINGS_SECURITY_RESTRICTIONS',
        entityKey: 'settings_security_restrictions',
        readPermission: 'system.settings.security.security_policy.restrictions.read',
    },
    {
        pageKey: 'Z_SETTINGS_SSO_OAUTH',
        entityKey: 'settings_security_sso_oauth',
        readPermission: 'system.settings.security.sso_oauth.read',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SETTINGS - USER RIGHTS
    // ═══════════════════════════════════════════════════════════════════════
    {
        pageKey: 'Z_ROLES',
        entityKey: 'roles',
        readPermission: 'system.settings.security.user_rights.roles.read',
    },
    {
        pageKey: 'Z_SETTINGS_USER_RIGHTS_ROLES',
        entityKey: 'settings_user_rights_roles',
        readPermission: 'system.settings.security.user_rights.roles.read',
    },
    {
        pageKey: 'Z_MATRIX_VIEW',
        entityKey: 'matrix_view',
        readPermission: 'system.settings.security.user_rights.matrix_view.read',
    },
    {
        pageKey: 'Z_COMPLIANCE',
        entityKey: 'compliance',
        readPermission: 'system.settings.security.user_rights.compliance.read',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BILLING DOMAIN
    // ═══════════════════════════════════════════════════════════════════════
    {
        pageKey: 'Z_BILLING',
        entityKey: 'billing',
        readPermission: 'system.billing.read',
    },
    {
        pageKey: 'Z_MARKETPLACE',
        entityKey: 'marketplace',
        readPermission: 'system.billing.market_place.read',
    },
    {
        pageKey: 'Z_PACKAGES',
        entityKey: 'packages',
        readPermission: 'system.billing.compact_packages.read',
    },
    {
        pageKey: 'Z_PLANS',
        entityKey: 'plans',
        readPermission: 'system.billing.plans.read',
    },
    {
        pageKey: 'Z_INVOICES',
        entityKey: 'invoices',
        readPermission: 'system.billing.invoices.read',
    },
    {
        pageKey: 'Z_LICENSES',
        entityKey: 'licenses',
        readPermission: 'system.billing.licenses.read',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BILLING CONFIGURATIONS
    // ═══════════════════════════════════════════════════════════════════════
    {
        pageKey: 'Z_BILLING_PRICING',
        entityKey: 'pricing',
        readPermission: 'system.settings.system_configurations.billing_configurations.pricing.read',
    },
    {
        pageKey: 'Z_BILLING_LIMITS',
        entityKey: 'limits',
        readPermission: 'system.settings.system_configurations.billing_configurations.limits.read',
    },
    {
        pageKey: 'Z_BILLING_OVERUSE',
        entityKey: 'overuse',
        readPermission: 'system.settings.system_configurations.billing_configurations.overuse.read',
    },
    {
        pageKey: 'Z_BILLING_GRACE',
        entityKey: 'grace',
        readPermission: 'system.settings.system_configurations.billing_configurations.grace.read',
    },
    {
        pageKey: 'Z_BILLING_CURRENCY',
        entityKey: 'currency',
        readPermission: 'system.settings.system_configurations.billing_configurations.currency_tax.read',
    },
    {
        pageKey: 'Z_BILLING_INVOICE_SETTINGS',
        entityKey: 'invoice',
        readPermission: 'system.settings.system_configurations.billing_configurations.invoice.read',
    },
    {
        pageKey: 'Z_BILLING_EVENTS',
        entityKey: 'events',
        readPermission: 'system.settings.system_configurations.billing_configurations.events.read',
    },
    {
        pageKey: 'Z_BILLING_SECURITY',
        entityKey: 'security',
        readPermission: 'system.settings.system_configurations.billing_configurations.security.read',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 14H TASK 1.4: Missing Z_* Objects
    // ═══════════════════════════════════════════════════════════════════════

    // Dashboard
    {
        pageKey: 'Z_DASHBOARD',
        entityKey: 'dashboard',
        readPermission: 'system.dashboard.read',
    },

    // Branches
    {
        pageKey: 'Z_BRANCHES',
        entityKey: 'branches',
        readPermission: 'system.branches.read',
    },

    // Approvals
    {
        pageKey: 'Z_APPROVALS',
        entityKey: 'approvals',
        readPermission: 'system.approvals.read',
    },
    {
        pageKey: 'Z_APPROVALS_INBOX',
        entityKey: 'approvals_inbox',
        readPermission: 'system.approvals.inbox.view',
    },

    // Files
    {
        pageKey: 'Z_FILES',
        entityKey: 'files',
        readPermission: 'system.file_manager.read',
    },

    // System Guide
    {
        pageKey: 'Z_GUIDE',
        entityKey: 'guide',
        readPermission: 'system.system_guide.read',
    },

    // System Console
    {
        pageKey: 'Z_CONSOLE',
        entityKey: 'console',
        readPermission: 'system.system_console.dashboard.read',
    },
    {
        pageKey: 'Z_CONSOLE_MONITORING',
        entityKey: 'console_monitoring',
        readPermission: 'system.system_console.monitoring.dashboard.read',
    },
    {
        pageKey: 'Z_CONSOLE_AUDIT',
        entityKey: 'console_audit',
        readPermission: 'system.system_console.audit_compliance.read',
    },
    {
        pageKey: 'Z_CONSOLE_JOBS',
        entityKey: 'console_jobs',
        readPermission: 'system.system_console.job_scheduler.read',
    },
    {
        pageKey: 'Z_CONSOLE_RETENTION',
        entityKey: 'console_retention',
        readPermission: 'system.system_console.data_retention.read',
    },
    {
        pageKey: 'Z_CONSOLE_FEATURES',
        entityKey: 'console_features',
        readPermission: 'system.system_console.feature_flags.read',
    },
    {
        pageKey: 'Z_CONSOLE_POLICY',
        entityKey: 'console_policy',
        readPermission: 'system.system_console.policy_security.read',
    },
    {
        pageKey: 'Z_CONSOLE_FEEDBACK',
        entityKey: 'console_feedback',
        readPermission: 'system.system_console.feedback.read',
    },
    {
        pageKey: 'Z_CONSOLE_TOOLS',
        entityKey: 'console_tools',
        readPermission: 'system.system_console.tools.read',
    },

    // Developer Hub
    {
        pageKey: 'Z_DEVELOPER',
        entityKey: 'developer',
        readPermission: 'system.developer_hub.api_reference.read',
    },
    {
        pageKey: 'Z_DEVELOPER_API',
        entityKey: 'developer_api',
        readPermission: 'system.developer_hub.api_reference.read',
    },
    {
        pageKey: 'Z_DEVELOPER_SDKS',
        entityKey: 'developer_sdks',
        readPermission: 'system.developer_hub.sdk.read',
    },
    {
        pageKey: 'Z_DEVELOPER_WEBHOOKS',
        entityKey: 'developer_webhooks',
        readPermission: 'system.developer_hub.webhooks.read',
    },
    {
        pageKey: 'Z_DEVELOPER_PERMISSIONS',
        entityKey: 'developer_permissions',
        readPermission: 'system.developer_hub.permission_map.read',
    },

    // Profile (always accessible if authenticated)
    {
        pageKey: 'Z_PROFILE',
        entityKey: 'profile',
        readPermission: 'system.users.users.read',
    },

    // Billing Tab Views (canonical keys for frontend)
    {
        pageKey: 'Z_BILLING_PLANS',
        entityKey: 'billing_plans',
        readPermission: 'system.billing.plans.read',
    },
    {
        pageKey: 'Z_BILLING_MARKETPLACE',
        entityKey: 'billing_marketplace',
        readPermission: 'system.billing.market_place.read',
    },
    {
        pageKey: 'Z_BILLING_PACKAGES',
        entityKey: 'billing_packages',
        readPermission: 'system.billing.compact_packages.read',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TENANT PORTAL DOMAIN
    // ═══════════════════════════════════════════════════════════════════════
    {
        pageKey: 'Z_TENANT_SETTINGS',
        entityKey: 'tenant_settings',
        readPermission: 'system.tenant_settings.read',
    },
    {
        pageKey: 'Z_TENANT_APPROVALS',
        entityKey: 'tenant_approvals',
        readPermission: 'system.tenant_approvals.read',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FINANCE DOMAIN
    // ═══════════════════════════════════════════════════════════════════════
    {
        pageKey: 'Z_FINANCE',
        entityKey: 'finance',
        readPermission: 'system.finance.read',
    },
];


/**
 * Get Page Authorization Object by pageKey
 * Returns undefined if not found (HARD DENY case)
 */
export function getPageObject(pageKey: string): PageAuthorizationObject | undefined {
    return PAGE_OBJECTS_REGISTRY.find(p => p.pageKey === pageKey);
}
