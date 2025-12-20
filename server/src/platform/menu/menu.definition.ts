
export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    path?: string;
    permission?: string;
    children?: MenuItem[];
    disabled?: boolean;
}

export const ADMIN_MENU_TREE: MenuItem[] = [
    // 1. Dashboard
    {
        id: 'dashboard',
        label: 'İdarə etmə paneli',
        icon: 'LayoutDashboard',
        path: '/admin/dashboard',
        permission: 'admin_panel.dashboard.read',
    },
    // 2. Tenants
    {
        id: 'tenants',
        label: 'Tenantlar',
        icon: 'Building2',
        path: '/admin/tenants',
        permission: 'admin_panel.tenants.read',
    },
    // 3. Branches
    {
        id: 'branches',
        label: 'Filiallar',
        icon: 'GitBranch',
        path: '/admin/branches',
        permission: 'admin_panel.branches.read',
    },
    // 4. Users (Group)
    {
        id: 'users_group',
        label: 'İstifadəçilər',
        icon: 'Users',
        children: [
            {
                id: 'users',
                label: 'İstifadəçilər',
                path: '/admin/users?tab=users',
                permission: 'admin_panel.users.users.read',
            },
            {
                id: 'curators',
                label: 'Kuratorlar',
                path: '/admin/users?tab=curators',
                permission: 'admin_panel.users.curators.read',
            }
        ]
    },
    // 5. Billing
    {
        id: 'billing',
        label: 'Bilinq',
        icon: 'CreditCard',
        children: [
            {
                id: 'market_place',
                label: 'Marketplace',
                path: '/admin/billing?tab=market_place',
                permission: 'admin_panel.billing.market_place.read',
            },
            {
                id: 'compact_packages',
                label: 'Kompakt Paketlər',
                path: '/admin/billing?tab=compact_packages',
                permission: 'admin_panel.billing.compact_packages.read', // Fixed permission slug (removed extra dot)
            },
            {
                id: 'plans',
                label: 'Planlar',
                path: '/admin/billing?tab=plans',
                permission: 'admin_panel.billing.plans.read',
            },
            {
                id: 'invoices',
                label: 'Fakturalar',
                path: '/admin/billing?tab=invoices',
                permission: 'admin_panel.billing.invoices.read',
            },
            {
                id: 'licenses',
                label: 'Lisenziyalar',
                path: '/admin/billing?tab=licenses',
                permission: 'admin_panel.billing.licenses.read',
            },
        ]
    },
    // 6. Approvals
    {
        id: 'approvals',
        label: 'Təsdiqləmələr',
        icon: 'CheckSquare',
        path: '/admin/approvals',
        permission: 'admin_panel.approvals.read',
    },
    // 7. File Manager
    {
        id: 'file_manager',
        label: 'Fayl Meneceri',
        icon: 'Folder',
        path: '/admin/files',
        permission: 'admin_panel.file_manager.read',
    },
    // 8. System Guide
    {
        id: 'system_guide',
        label: 'Sistem Bələdçisi',
        icon: 'BookOpen',
        path: '/admin/guide',
        permission: 'admin_panel.system_guide.read',
    },
    // 9. Settings
    {
        id: 'settings',
        label: 'Tənzimləmələr',
        icon: 'Settings',
        children: [
            {
                id: 'general',
                label: 'Ümumi',
                icon: 'Sliders',
                children: [
                    { id: 'company_profile', label: 'Şirkət Profili', path: '/admin/settings?tab=general', permission: 'admin_panel.settings.general.company_profile.read' },
                    { id: 'notification_engine', label: 'Bildiriş Mühərriki', path: '/admin/settings?tab=notifications', permission: 'admin_panel.settings.general.notification_engine.read' },
                ]
            },
            {
                id: 'communication',
                label: 'Kommunikasiya',
                icon: 'MessageSquare',
                children: [
                    { id: 'smtp_email', label: 'SMTP Email', path: '/admin/settings?tab=smtp', permission: 'admin_panel.settings.communication.smtp_email.read' },
                    { id: 'smtp_sms', label: 'SMS Gateway', path: '/admin/settings?tab=sms', permission: 'admin_panel.settings.communication.smtp_sms.read' },
                ]
            },
            {
                id: 'security',
                label: 'Təhlükəsizlik',
                icon: 'Shield',
                children: [
                    { id: 'policies', label: 'Siyasətlər (Policies)', path: '/admin/settings?tab=security', permission: 'admin_panel.settings.security.security_policy.global_policy.read' },
                    { id: 'sso', label: 'SSO & OAuth', path: '/admin/settings?tab=sso', permission: 'admin_panel.settings.security.sso_OAuth.read' },
                    { id: 'rights', label: 'İstifadəçi Hüquqları', path: '/admin/settings?tab=roles', permission: 'admin_panel.settings.security.user_rights.role.read' },
                ]
            },
            {
                id: 'system_config',
                label: 'Sistem Konfiqurasiyası',
                icon: 'Database', // or Settings2
                children: [
                    { id: 'billing_config', label: 'Bilinq Ayarları', path: '/admin/settings?tab=billing_config', permission: 'admin_panel.settings.system_configurations.billing_configurations.price_rules.read' }, // Consolidated permission
                    {
                        id: 'dictionaries',
                        label: 'Soraqçalar',
                        icon: 'Book',
                        children: [
                            { id: 'sectors', label: 'Sektorlar', path: '/admin/settings?tab=dictionaries&entity=sectors', permission: 'admin_panel.settings.system_configurations.dictionary.sectors.read' },
                            { id: 'units', label: 'Ölçü Vahidləri', path: '/admin/settings?tab=dictionaries&entity=units', permission: 'admin_panel.settings.system_configurations.dictionary.units.read' },
                            { id: 'currencies', label: 'Valyutalar', path: '/admin/settings?tab=dictionaries&entity=currencies', permission: 'admin_panel.settings.system_configurations.dictionary.currencies.read' },
                            { id: 'time_zones', label: 'Saat Qurşaqları', path: '/admin/settings?tab=dictionaries&entity=time_zones', permission: 'admin_panel.settings.system_configurations.dictionary.time_zones.read' },
                            {
                                id: 'addresses',
                                label: 'Ünvanlar',
                                children: [
                                    { id: 'country', label: 'Ölkələr', path: '/admin/settings?tab=dictionaries&entity=country', permission: 'admin_panel.settings.system_configurations.dictionary.addresses.country.read' },
                                    { id: 'city', label: 'Şəhərlər', path: '/admin/settings?tab=dictionaries&entity=city', permission: 'admin_panel.settings.system_configurations.dictionary.addresses.city.read' },
                                    { id: 'district', label: 'Rayonlar', path: '/admin/settings?tab=dictionaries&entity=district', permission: 'admin_panel.settings.system_configurations.dictionary.addresses.district.read' },
                                ]
                            }
                        ]
                    },
                    { id: 'templates', label: 'Sənəd Şablonları', path: '/admin/settings?tab=templates', permission: 'admin_panel.settings.system_configurations.document_templates.read' },
                    { id: 'workflow', label: 'Workflow', path: '/admin/settings?tab=workflow', permission: 'admin_panel.settings.system_configurations.workflow.configuration.read' },
                ]
            }
        ]
    },
    // 10. System Console
    {
        id: 'system_console',
        label: 'Sistem Konsolu',
        icon: 'Terminal',
        children: [
            { id: 'console_dash', label: 'Dashboard', path: '/admin/console?tab=dashboard', permission: 'admin_panel.system_console.dashboard.read' },
            { id: 'monitoring', label: 'Monitoring', path: '/admin/console?tab=monitoring', permission: 'admin_panel.system_console.monitoring.dashboard.read' },
            { id: 'audit', label: 'Audit & Compliance', path: '/admin/console?tab=audit', permission: 'admin_panel.system_console.audit_compliance.read' },
            { id: 'scheduler', label: 'Job Scheduler', path: '/admin/console?tab=scheduler', permission: 'admin_panel.system_console.job_scheduler.read' },
            { id: 'retention', label: 'Data Retention', path: '/admin/console?tab=retention', permission: 'admin_panel.system_console.data_retention.read' },
            { id: 'feature_flags', label: 'Feature Flags', path: '/admin/console?tab=feature_flags', permission: 'admin_panel.system_console.feature_flags.read' },
            // Added omitted items
            { id: 'policy_security', label: 'Policy Security', path: '/admin/console?tab=policy', permission: 'admin_panel.system_console.policy_security.read' },
            { id: 'feedback', label: 'Feedback', path: '/admin/console?tab=feedback', permission: 'admin_panel.system_console.feedback.read' },
            { id: 'tools', label: 'Tools', path: '/admin/console?tab=tools', permission: 'admin_panel.system_console.tools.read' },
        ]
    },
    // 11. Developer Hub
    {
        id: 'developer_hub',
        label: 'Developer Hub',
        icon: 'Code',
        children: [
            { id: 'api', label: 'API Reference', path: '/admin/developer?tab=api', permission: 'admin_panel.developer_hub.api_reference.read' },
            { id: 'sdk', label: 'SDKs', path: '/admin/developer?tab=sdk', permission: 'admin_panel.developer_hub.sdk.read' },
            { id: 'webhooks', label: 'Webhooks', path: '/admin/developer?tab=webhooks', permission: 'admin_panel.developer_hub.webhooks.read' },
            { id: 'perm_map', label: 'Permission Map', path: '/admin/developer?tab=permissions', permission: 'admin_panel.developer_hub.permission_map.read' },
        ]
    },
];
