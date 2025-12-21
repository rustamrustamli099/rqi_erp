export declare const RolePresets: {
    SYSTEM: {
        SUPER_ADMIN: {
            name: string;
            description: string;
            permissions: ("dashboard.view" | "tenants.view" | "tenants.create" | "tenants.update" | "tenants.delete" | "branches.view" | "branches.create" | "branches.update" | "branches.delete" | "users.users.view" | "users.users.create" | "users.users.update" | "users.users.delete" | "users.curators.view" | "users.curators.create" | "users.curators.update" | "users.curators.delete" | "billing.market_place.view" | "billing.market_place.manage" | "billing.compact_packages.view" | "billing.compact_packages.manage" | "billing.subscriptions.view" | "billing.subscriptions.create" | "billing.subscriptions.update" | "billing.subscriptions.delete" | "billing.plans.view" | "billing.plans.manage" | "billing.invoices.view" | "billing.invoices.approve" | "billing.licenses.view" | "billing.licenses.manage" | "approvals.view" | "approvals.approve" | "file_manager.view" | "file_manager.upload" | "file_manager.delete" | "system_guide.view" | "system_guide.manage" | "settings.general.company_profile.view" | "settings.general.company_profile.update" | "settings.general.notification_engine.view" | "settings.general.notification_engine.manage" | "settings.communication.smtp_email.view" | "settings.communication.smtp_email.manage" | "settings.communication.smtp_sms.view" | "settings.communication.smtp_sms.manage" | "settings.security.security_policy.view" | "settings.security.security_policy.manage" | "settings.security.sso_oauth.view" | "settings.security.sso_oauth.manage" | "settings.security.user_rights.view" | "settings.security.user_rights.manage" | "settings.system_configurations.billing_configurations.view" | "settings.system_configurations.billing_configurations.manage" | "settings.system_configurations.dictionary.view" | "settings.system_configurations.dictionary.manage" | "settings.system_configurations.document_templates.view" | "settings.system_configurations.document_templates.manage" | "settings.system_configurations.workflow.view" | "settings.system_configurations.workflow.manage" | "system_console.dashboard.view" | "system_console.monitoring.view" | "system_console.audit_compliance.view" | "system_console.job_scheduler.view" | "system_console.job_scheduler.execute" | "system_console.data_retention.view" | "system_console.data_retention.manage" | "system_console.feature_flags.view" | "system_console.feature_flags.manage" | "system_console.policy_security.view" | "system_console.policy_security.manage" | "system_console.feedback.view" | "system_console.feedback.manage" | "system_console.tools.view" | "system_console.tools.execute" | "system_console.users.impersonate" | "developer_hub.api_reference.view" | "developer_hub.sdk.view" | "developer_hub.webhooks.view" | "developer_hub.webhooks.manage" | "developer_hub.permission_map.view")[];
        };
        SUPPORT: {
            name: string;
            description: string;
            permissions: ("dashboard.view" | "tenants.view" | "branches.view" | "users.users.view" | "users.curators.view" | "system_console.dashboard.view" | "system_console.monitoring.view" | "system_console.audit_compliance.view" | "system_console.feedback.view" | "system_console.users.impersonate")[];
        };
        AUDITOR: {
            name: string;
            description: string;
            permissions: ("settings.security.user_rights.view" | "system_console.audit_compliance.view" | "system_console.data_retention.view")[];
        };
        DEVELOPER: {
            name: string;
            description: string;
            permissions: ("system_console.monitoring.view" | "system_console.feature_flags.view" | "system_console.feature_flags.manage" | "system_console.tools.view" | "system_console.tools.execute" | "developer_hub.api_reference.view" | "developer_hub.sdk.view" | "developer_hub.webhooks.view" | "developer_hub.webhooks.manage" | "developer_hub.permission_map.view")[];
        };
    };
    TENANT: {
        OWNER: {
            name: string;
            description: string;
            permissions: ("dashboard.view" | "branches.view" | "branches.create" | "branches.update" | "branches.delete" | "users.users.view" | "users.users.create" | "users.users.update" | "users.users.delete" | "users.curators.view" | "users.curators.create" | "users.curators.update" | "users.curators.delete" | "billing.market_place.view" | "billing.market_place.manage" | "billing.compact_packages.view" | "billing.compact_packages.manage" | "billing.subscriptions.view" | "billing.subscriptions.create" | "billing.subscriptions.update" | "billing.subscriptions.delete" | "billing.plans.view" | "billing.plans.manage" | "billing.invoices.view" | "billing.invoices.approve" | "billing.licenses.view" | "billing.licenses.manage" | "approvals.view" | "approvals.approve" | "file_manager.view" | "file_manager.upload" | "file_manager.delete" | "system_guide.view" | "system_guide.manage" | "settings.general.company_profile.view" | "settings.general.company_profile.update" | "settings.general.notification_engine.view" | "settings.general.notification_engine.manage" | "settings.communication.smtp_email.view" | "settings.communication.smtp_email.manage" | "settings.communication.smtp_sms.view" | "settings.communication.smtp_sms.manage" | "settings.security.security_policy.view" | "settings.security.security_policy.manage" | "settings.security.sso_oauth.view" | "settings.security.sso_oauth.manage" | "settings.security.user_rights.view" | "settings.security.user_rights.manage" | "settings.system_configurations.billing_configurations.view" | "settings.system_configurations.billing_configurations.manage" | "settings.system_configurations.dictionary.view" | "settings.system_configurations.dictionary.manage" | "settings.system_configurations.document_templates.view" | "settings.system_configurations.document_templates.manage" | "settings.system_configurations.workflow.view" | "settings.system_configurations.workflow.manage")[];
        };
        ADMIN: {
            name: string;
            description: string;
            permissions: ("dashboard.view" | "branches.view" | "branches.create" | "branches.update" | "branches.delete" | "users.users.view" | "users.users.create" | "users.users.update" | "users.users.delete" | "users.curators.view" | "users.curators.create" | "users.curators.update" | "users.curators.delete" | "billing.subscriptions.view" | "billing.plans.view" | "billing.invoices.view" | "settings.general.company_profile.view" | "settings.general.company_profile.update" | "settings.general.notification_engine.view" | "settings.general.notification_engine.manage" | "settings.communication.smtp_email.view" | "settings.communication.smtp_email.manage" | "settings.communication.smtp_sms.view" | "settings.communication.smtp_sms.manage" | "settings.security.security_policy.view" | "settings.security.security_policy.manage" | "settings.security.sso_oauth.view" | "settings.security.sso_oauth.manage" | "settings.security.user_rights.view" | "settings.security.user_rights.manage" | "settings.system_configurations.billing_configurations.view" | "settings.system_configurations.billing_configurations.manage" | "settings.system_configurations.dictionary.view" | "settings.system_configurations.dictionary.manage" | "settings.system_configurations.document_templates.view" | "settings.system_configurations.document_templates.manage" | "settings.system_configurations.workflow.view" | "settings.system_configurations.workflow.manage")[];
        };
        MANAGER: {
            name: string;
            description: string;
            permissions: ("dashboard.view" | "branches.view" | "branches.update" | "users.users.view" | "users.users.create" | "users.users.update" | "approvals.view" | "approvals.approve")[];
        };
        FINANCE: {
            name: string;
            description: string;
            permissions: ("dashboard.view" | "billing.market_place.view" | "billing.market_place.manage" | "billing.compact_packages.view" | "billing.compact_packages.manage" | "billing.subscriptions.view" | "billing.subscriptions.create" | "billing.subscriptions.update" | "billing.subscriptions.delete" | "billing.plans.view" | "billing.plans.manage" | "billing.invoices.view" | "billing.invoices.approve" | "billing.licenses.view" | "billing.licenses.manage" | "settings.system_configurations.billing_configurations.view" | "settings.system_configurations.billing_configurations.manage")[];
        };
        HR: {
            name: string;
            description: string;
            permissions: ("dashboard.view" | "users.users.view" | "users.users.create" | "users.users.update" | "users.users.delete" | "users.curators.view" | "users.curators.create" | "users.curators.update" | "users.curators.delete" | "settings.general.company_profile.view" | "settings.general.company_profile.update")[];
        };
        VIEWER: {
            name: string;
            description: string;
            permissions: ("dashboard.view" | "branches.view" | "users.users.view" | "system_guide.view")[];
        };
    };
};
