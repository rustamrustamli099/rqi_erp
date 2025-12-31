export declare const PermissionRegistry: {
    readonly DASHBOARD: {
        readonly VIEW: "dashboard.view";
    };
    readonly TENANTS: {
        readonly VIEW: "tenants.view";
        readonly CREATE: "tenants.create";
        readonly UPDATE: "tenants.update";
        readonly DELETE: "tenants.delete";
    };
    readonly BRANCHES: {
        readonly VIEW: "branches.view";
        readonly CREATE: "branches.create";
        readonly UPDATE: "branches.update";
        readonly DELETE: "branches.delete";
    };
    readonly USERS: {
        readonly USERS_VIEW: "users.users.view";
        readonly USERS_CREATE: "users.users.create";
        readonly USERS_UPDATE: "users.users.update";
        readonly USERS_DELETE: "users.users.delete";
        readonly CURATORS_VIEW: "users.curators.view";
        readonly CURATORS_CREATE: "users.curators.create";
        readonly CURATORS_UPDATE: "users.curators.update";
        readonly CURATORS_DELETE: "users.curators.delete";
    };
    readonly BILLING: {
        readonly MARKET_PLACE_VIEW: "billing.market_place.view";
        readonly MARKET_PLACE_MANAGE: "billing.market_place.manage";
        readonly COMPACT_PACKAGES_VIEW: "billing.compact_packages.view";
        readonly COMPACT_PACKAGES_MANAGE: "billing.compact_packages.manage";
        readonly SUBSCRIPTIONS_VIEW: "billing.subscriptions.view";
        readonly SUBSCRIPTIONS_CREATE: "billing.subscriptions.create";
        readonly SUBSCRIPTIONS_UPDATE: "billing.subscriptions.update";
        readonly SUBSCRIPTIONS_DELETE: "billing.subscriptions.delete";
        readonly PLANS_VIEW: "billing.plans.view";
        readonly PLANS_MANAGE: "billing.plans.manage";
        readonly INVOICES_VIEW: "billing.invoices.view";
        readonly INVOICES_APPROVE: "billing.invoices.approve";
        readonly LICENSES_VIEW: "billing.licenses.view";
        readonly LICENSES_MANAGE: "billing.licenses.manage";
    };
    readonly APPROVALS: {
        readonly VIEW: "approvals.view";
        readonly APPROVE: "approvals.approve";
    };
    readonly FILE_MANAGER: {
        readonly VIEW: "file_manager.view";
        readonly UPLOAD: "file_manager.upload";
        readonly DELETE: "file_manager.delete";
    };
    readonly SYSTEM_GUIDE: {
        readonly VIEW: "system_guide.view";
        readonly MANAGE: "system_guide.manage";
    };
    readonly SETTINGS: {
        readonly COMPANY_PROFILE_VIEW: "settings.general.company_profile.view";
        readonly COMPANY_PROFILE_UPDATE: "settings.general.company_profile.update";
        readonly NOTIFICATION_ENGINE_VIEW: "settings.general.notification_engine.view";
        readonly NOTIFICATION_ENGINE_MANAGE: "settings.general.notification_engine.manage";
        readonly SMTP_EMAIL_VIEW: "settings.communication.smtp_email.view";
        readonly SMTP_EMAIL_MANAGE: "settings.communication.smtp_email.manage";
        readonly SMTP_SMS_VIEW: "settings.communication.smtp_sms.view";
        readonly SMTP_SMS_MANAGE: "settings.communication.smtp_sms.manage";
        readonly SECURITY_POLICY_VIEW: "settings.security.security_policy.view";
        readonly SECURITY_POLICY_MANAGE: "settings.security.security_policy.manage";
        readonly SSO_OAUTH_VIEW: "settings.security.sso_oauth.view";
        readonly SSO_OAUTH_MANAGE: "settings.security.sso_oauth.manage";
        readonly USER_RIGHTS_VIEW: "settings.security.user_rights.view";
        readonly USER_RIGHTS_MANAGE: "settings.security.user_rights.manage";
        readonly BILLING_CONFIG_VIEW: "settings.system_configurations.billing_configurations.view";
        readonly BILLING_CONFIG_MANAGE: "settings.system_configurations.billing_configurations.manage";
        readonly DICTIONARY_VIEW: "settings.system_configurations.dictionary.view";
        readonly DICTIONARY_MANAGE: "settings.system_configurations.dictionary.manage";
        readonly DOC_TEMPLATES_VIEW: "settings.system_configurations.document_templates.view";
        readonly DOC_TEMPLATES_MANAGE: "settings.system_configurations.document_templates.manage";
        readonly WORKFLOW_VIEW: "settings.system_configurations.workflow.view";
        readonly WORKFLOW_MANAGE: "settings.system_configurations.workflow.manage";
    };
    readonly SYSTEM_CONSOLE: {
        readonly DASHBOARD_VIEW: "system_console.dashboard.view";
        readonly MONITORING_VIEW: "system_console.monitoring.view";
        readonly AUDIT_COMPLIANCE_VIEW: "system_console.audit_compliance.view";
        readonly JOB_SCHEDULER_VIEW: "system_console.job_scheduler.view";
        readonly JOB_SCHEDULER_EXECUTE: "system_console.job_scheduler.execute";
        readonly DATA_RETENTION_VIEW: "system_console.data_retention.view";
        readonly DATA_RETENTION_MANAGE: "system_console.data_retention.manage";
        readonly FEATURE_FLAGS_VIEW: "system_console.feature_flags.view";
        readonly FEATURE_FLAGS_MANAGE: "system_console.feature_flags.manage";
        readonly POLICY_SECURITY_VIEW: "system_console.policy_security.view";
        readonly POLICY_SECURITY_MANAGE: "system_console.policy_security.manage";
        readonly FEEDBACK_VIEW: "system_console.feedback.view";
        readonly FEEDBACK_MANAGE: "system_console.feedback.manage";
        readonly TOOLS_VIEW: "system_console.tools.view";
        readonly TOOLS_EXECUTE: "system_console.tools.execute";
        readonly USERS_IMPERSONATE: "system_console.users.impersonate";
    };
    readonly DEVELOPER_HUB: {
        readonly API_REFERENCE_VIEW: "developer_hub.api_reference.view";
        readonly SDK_VIEW: "developer_hub.sdk.view";
        readonly WEBHOOKS_VIEW: "developer_hub.webhooks.view";
        readonly WEBHOOKS_MANAGE: "developer_hub.webhooks.manage";
        readonly PERMISSION_MAP_VIEW: "developer_hub.permission_map.view";
    };
};
export type PermissionID = string;
