/**
 * PHASE 14G: Backend Action Permissions Registry
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Canonical action-to-permission mapping for Decision Center.
 * SYNCED with permission-structure.ts slug format.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface ActionPermissionDef {
    actionKey: string;
    permissionSlug: string;
}

export interface EntityActionConfig {
    entityKey: string;
    scope: 'system' | 'tenant';
    actions: ActionPermissionDef[];
}

export const ACTION_PERMISSIONS_REGISTRY: EntityActionConfig[] = [
    // ─────────────────────────────────────────────────────────────────────────
    // Tenants Entity (Phase 14G)
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'tenants',
        scope: 'system',
        actions: [
            { actionKey: 'create', permissionSlug: 'system.tenants.create' },
            { actionKey: 'update', permissionSlug: 'system.tenants.update' },
            { actionKey: 'delete', permissionSlug: 'system.tenants.delete' },
            { actionKey: 'impersonate', permissionSlug: 'system.tenants.impersonate' },
            { actionKey: 'manage_users', permissionSlug: 'system.tenants.manage_users' },
            { actionKey: 'manage_security', permissionSlug: 'system.tenants.manage_security' },
            { actionKey: 'manage_billing', permissionSlug: 'system.tenants.manage_billing' },
            { actionKey: 'manage_features', permissionSlug: 'system.tenants.manage_features' },
            { actionKey: 'manage_contract', permissionSlug: 'system.tenants.manage_contract' },
            { actionKey: 'view_audit', permissionSlug: 'system.tenants.view_audit' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.tenants.export_to_excel' },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Users Entity - Synced with permission-structure.ts
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'users',
        scope: 'system',
        actions: [
            { actionKey: 'create', permissionSlug: 'system.users.users.create' },
            { actionKey: 'read', permissionSlug: 'system.users.users.read' },
            { actionKey: 'update', permissionSlug: 'system.users.users.update' },
            { actionKey: 'delete', permissionSlug: 'system.users.users.delete' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.users.users.export_to_excel' },
            { actionKey: 'change_status', permissionSlug: 'system.users.users.change_status' },
            { actionKey: 'connect_to_employee', permissionSlug: 'system.users.users.connect_to_employee' },
            { actionKey: 'invite', permissionSlug: 'system.users.users.invite' },
            // Row-level actions
            { actionKey: 'impersonate', permissionSlug: 'system.users.users.impersonate' },
            { actionKey: 'send_invite', permissionSlug: 'system.users.users.send_invite' },
            { actionKey: 'manage_restrictions', permissionSlug: 'system.users.users.manage_restrictions' },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Roles Entity - Synced with permission-structure.ts
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'roles',
        scope: 'system',
        actions: [
            { actionKey: 'create', permissionSlug: 'system.settings.security.user_rights.roles.create' },
            { actionKey: 'read', permissionSlug: 'system.settings.security.user_rights.roles.read' },
            { actionKey: 'update', permissionSlug: 'system.settings.security.user_rights.roles.update' },
            { actionKey: 'delete', permissionSlug: 'system.settings.security.user_rights.roles.delete' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.settings.security.user_rights.roles.export_to_excel' },
            { actionKey: 'submit', permissionSlug: 'system.settings.security.user_rights.roles.submit' },
            { actionKey: 'approve', permissionSlug: 'system.settings.security.user_rights.roles.approve' },
            { actionKey: 'reject', permissionSlug: 'system.settings.security.user_rights.roles.reject' },
            { actionKey: 'select_permissions', permissionSlug: 'system.settings.security.user_rights.roles.select_permissions' },
            { actionKey: 'change_status', permissionSlug: 'system.settings.security.user_rights.roles.change_status' },
            { actionKey: 'copy', permissionSlug: 'system.settings.security.user_rights.roles.copy' },
            { actionKey: 'view_audit_log', permissionSlug: 'system.settings.security.user_rights.roles.view_audit_log' },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Curators Entity - Synced with permission-structure.ts
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'curators',
        scope: 'system',
        actions: [
            { actionKey: 'create', permissionSlug: 'system.users.curators.create' },
            { actionKey: 'read', permissionSlug: 'system.users.curators.read' },
            { actionKey: 'update', permissionSlug: 'system.users.curators.update' },
            { actionKey: 'delete', permissionSlug: 'system.users.curators.delete' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.users.curators.export_to_excel' },
            { actionKey: 'change_status', permissionSlug: 'system.users.curators.change_status' },
            { actionKey: 'copy_id', permissionSlug: 'system.users.curators.copy_id' },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Billing Entity - Synced with permission-structure.ts
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'marketplace',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.billing.market_place.read' },
            { actionKey: 'create', permissionSlug: 'system.billing.market_place.create' },
            { actionKey: 'update', permissionSlug: 'system.billing.market_place.update' },
            { actionKey: 'delete', permissionSlug: 'system.billing.market_place.delete' },
            { actionKey: 'change_status', permissionSlug: 'system.billing.market_place.change_status' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.billing.market_place.export_to_excel' },
        ],
    },
    {
        entityKey: 'packages',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.billing.compact_packages.read' },
            { actionKey: 'create', permissionSlug: 'system.billing.compact_packages.create' },
            { actionKey: 'update', permissionSlug: 'system.billing.compact_packages.update' },
            { actionKey: 'delete', permissionSlug: 'system.billing.compact_packages.delete' },
            { actionKey: 'change_status', permissionSlug: 'system.billing.compact_packages.change_status' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.billing.compact_packages.export_to_excel' },
        ],
    },
    {
        entityKey: 'plans',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.billing.plans.read' },
            { actionKey: 'create', permissionSlug: 'system.billing.plans.create' },
            { actionKey: 'update', permissionSlug: 'system.billing.plans.update' },
            { actionKey: 'delete', permissionSlug: 'system.billing.plans.delete' },
            { actionKey: 'change_status', permissionSlug: 'system.billing.plans.change_status' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.billing.plans.export_to_excel' },
        ],
    },
    {
        entityKey: 'invoices',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.billing.invoices.read' },
            { actionKey: 'download', permissionSlug: 'system.billing.invoices.download' },
            { actionKey: 'resend', permissionSlug: 'system.billing.invoices.resend' },
            { actionKey: 'void', permissionSlug: 'system.billing.invoices.void' },
            { actionKey: 'pay', permissionSlug: 'system.billing.invoices.pay' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.billing.invoices.export_to_excel' },
        ],
    },
    {
        entityKey: 'licenses',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.billing.licenses.read' },
            { actionKey: 'change_plan', permissionSlug: 'system.billing.licenses.change_plan' },
            { actionKey: 'manage_seats', permissionSlug: 'system.billing.licenses.manage_seats' },
            { actionKey: 'cancel', permissionSlug: 'system.billing.licenses.cancel' },
            { actionKey: 'view_audit', permissionSlug: 'system.billing.licenses.view_audit' },
        ],
    },
    // ─────────────────────────────────────────────────────────────────────────
    // Settings Entities (Phase 15A)
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'settings_company_profile',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.general.company_profile.read' },
            { actionKey: 'update', permissionSlug: 'system.settings.general.company_profile.update' },
        ],
    },
    {
        entityKey: 'settings_notification_engine',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.general.notification_engine.read' },
            { actionKey: 'create', permissionSlug: 'system.settings.general.notification_engine.create' },
            { actionKey: 'update', permissionSlug: 'system.settings.general.notification_engine.update' },
            { actionKey: 'delete', permissionSlug: 'system.settings.general.notification_engine.delete' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.settings.general.notification_engine.export_to_excel' },
            { actionKey: 'change_status', permissionSlug: 'system.settings.general.notification_engine.change_status' },
            { actionKey: 'copy_json', permissionSlug: 'system.settings.general.notification_engine.copy_json' },
        ],
    },
    {
        entityKey: 'settings_communication_email',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.communication.smtp_email.read' },
            { actionKey: 'update', permissionSlug: 'system.settings.communication.smtp_email.update' },
            { actionKey: 'send_test', permissionSlug: 'system.settings.communication.smtp_email.send_test' },
            { actionKey: 'change_status', permissionSlug: 'system.settings.communication.smtp_email.change_status' },
        ],
    },
    {
        entityKey: 'settings_communication_sms',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.communication.smtp_sms.read' },
            { actionKey: 'update', permissionSlug: 'system.settings.communication.smtp_sms.update' },
            { actionKey: 'send_test', permissionSlug: 'system.settings.communication.smtp_sms.send_test' },
            { actionKey: 'change_status', permissionSlug: 'system.settings.communication.smtp_sms.change_status' },
        ],
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // SECURITY - Security Policy Entities
    // ═══════════════════════════════════════════════════════════════════════════
    {
        entityKey: 'settings_security_password',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.security.security_policy.password.read' },
            { actionKey: 'update', permissionSlug: 'system.settings.security.security_policy.password.update' },
        ],
    },
    {
        entityKey: 'settings_security_login',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.security.security_policy.login.read' },
            { actionKey: 'update', permissionSlug: 'system.settings.security.security_policy.login.update' },
        ],
    },
    {
        entityKey: 'settings_security_session',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.security.security_policy.session.read' },
            { actionKey: 'update', permissionSlug: 'system.settings.security.security_policy.session.update' },
        ],
    },
    {
        entityKey: 'settings_security_restrictions',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.security.security_policy.restrictions.read' },
            { actionKey: 'create', permissionSlug: 'system.settings.security.security_policy.restrictions.create' },
            { actionKey: 'update', permissionSlug: 'system.settings.security.security_policy.restrictions.update' },
            { actionKey: 'delete', permissionSlug: 'system.settings.security.security_policy.restrictions.delete' },
            { actionKey: 'change_status', permissionSlug: 'system.settings.security.security_policy.restrictions.change_status' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.settings.security.security_policy.restrictions.export_to_excel' },
        ],
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // SECURITY - SSO & OAuth
    // ═══════════════════════════════════════════════════════════════════════════
    {
        entityKey: 'settings_security_sso_oauth',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.security.sso_oauth.read' },
            { actionKey: 'create', permissionSlug: 'system.settings.security.sso_oauth.create' },
            { actionKey: 'update', permissionSlug: 'system.settings.security.sso_oauth.update' },
            { actionKey: 'delete', permissionSlug: 'system.settings.security.sso_oauth.delete' },
            { actionKey: 'change_status', permissionSlug: 'system.settings.security.sso_oauth.change_status' },
            { actionKey: 'test_connection', permissionSlug: 'system.settings.security.sso_oauth.test_connection' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.settings.security.sso_oauth.export_to_excel' },
        ],
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // SECURITY - User Rights -> Roles
    // ═══════════════════════════════════════════════════════════════════════════
    {
        entityKey: 'settings_user_rights_roles', // Maps to user_rights tab -> roles subtab
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.security.user_rights.roles.read' },
            { actionKey: 'create', permissionSlug: 'system.settings.security.user_rights.roles.create' },
            { actionKey: 'update', permissionSlug: 'system.settings.security.user_rights.roles.update' },
            { actionKey: 'delete', permissionSlug: 'system.settings.security.user_rights.roles.delete' },
            { actionKey: 'export_to_excel', permissionSlug: 'system.settings.security.user_rights.roles.export_to_excel' },
            { actionKey: 'select_permissions', permissionSlug: 'system.settings.security.user_rights.roles.select_permissions' },
            { actionKey: 'change_status', permissionSlug: 'system.settings.security.user_rights.roles.change_status' },
            { actionKey: 'copy', permissionSlug: 'system.settings.security.user_rights.roles.copy' },
            { actionKey: 'view_audit_log', permissionSlug: 'system.settings.security.user_rights.roles.view_audit_log' },
            { actionKey: 'submit', permissionSlug: 'system.settings.security.user_rights.roles.submit' },
        ],
    },
    // Matrix View
    {
        entityKey: 'matrix_view',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.security.user_rights.matrix_view.read' },
            { actionKey: 'update', permissionSlug: 'system.settings.security.user_rights.matrix_view.update' },
        ],
    },
    // Compliance View
    {
        entityKey: 'compliance',
        scope: 'system',
        actions: [
            { actionKey: 'read', permissionSlug: 'system.settings.security.user_rights.compliance.read' },
            { actionKey: 'download_report', permissionSlug: 'system.settings.security.user_rights.compliance.download_report' },
            { actionKey: 'generate_evidence', permissionSlug: 'system.settings.security.user_rights.compliance.generate_evidence' },
            { actionKey: 'download_json_soc2', permissionSlug: 'system.settings.security.user_rights.compliance.download_json_soc2' },
            { actionKey: 'download_json_iso', permissionSlug: 'system.settings.security.user_rights.compliance.download_json_iso' },
        ],
    },
    // Billing Configurations
    {
        entityKey: 'pricing',
        scope: 'system',
        actions: [
            {
                actionKey: 'update',
                permissionSlug: 'system.settings.system_configurations.billing_configurations.pricing.update'
            }
        ]
    },
    {
        entityKey: 'limits',
        scope: 'system',
        actions: [{ actionKey: 'update', permissionSlug: 'system.settings.system_configurations.billing_configurations.limits.update' }]
    },
    {
        entityKey: 'overuse',
        scope: 'system',
        actions: [{ actionKey: 'update', permissionSlug: 'system.settings.system_configurations.billing_configurations.overuse.update' }]
    },
    {
        entityKey: 'grace',
        scope: 'system',
        actions: [{ actionKey: 'update', permissionSlug: 'system.settings.system_configurations.billing_configurations.grace.update' }]
    },
    {
        entityKey: 'currency',
        scope: 'system',
        actions: [{ actionKey: 'update', permissionSlug: 'system.settings.system_configurations.billing_configurations.currency_tax.update' }]
    },
    {
        entityKey: 'invoice',
        scope: 'system',
        actions: [{ actionKey: 'update', permissionSlug: 'system.settings.system_configurations.billing_configurations.invoice.update' }]
    },
    {
        entityKey: 'events',
        scope: 'system',
        actions: [{ actionKey: 'update', permissionSlug: 'system.settings.system_configurations.billing_configurations.events.update' }]
    },
    {
        entityKey: 'security',
        scope: 'system',
        actions: [{ actionKey: 'update', permissionSlug: 'system.settings.system_configurations.billing_configurations.security.update' }]
    },
];
