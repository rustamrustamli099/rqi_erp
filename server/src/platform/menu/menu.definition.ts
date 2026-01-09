
export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    path?: string;
    permission?: string;
    children?: MenuItem[];
    disabled?: boolean;
    actions?: any; // Contextual actions resolved by Decision Center
}

export const ADMIN_MENU_TREE: MenuItem[] = [
    // 1. Dashboard
    {
        id: 'dashboard',
        label: 'İdarə etmə paneli',
        icon: 'LayoutDashboard',
        path: '/admin/dashboard',
        permission: 'system.dashboard.read',
    },
    // 2. Tenants
    {
        id: 'tenants',
        label: 'Tenantlar',
        icon: 'Building2',
        path: '/admin/tenants',
        permission: 'system.tenants.read',
    },
    // 3. Branches
    {
        id: 'branches',
        label: 'Filiallar',
        icon: 'GitBranch',
        path: '/admin/branches',
        permission: 'system.branches.read',
    },
    // 4. Users (Group)
    {
        id: 'users_group',
        label: 'İstifadəçilər',
        icon: 'Users',
        children: [{
            id: 'users',
            label: 'İstifadəçilər',
            path: '/admin/users?tab=users',
            permission: 'system.users.users.read',
        },
        {
            id: 'curators',
            label: 'Kuratorlar',
            path: '/admin/users?tab=curators',
            permission: 'system.users.curators.read',
        }
        ]
    },
    // 5. Billing
    {
        id: 'billing',
        label: 'Bilinq',
        icon: 'CreditCard',
        children: [{
            id: 'market_place',
            label: 'Marketplace',
            path: '/admin/billing?tab=market_place',
            permission: 'system.billing.market_place.read',
        },
        {
            id: 'compact_packages',
            label: 'Kompakt Paketlər',
            path: '/admin/billing?tab=compact_packages',
            permission: 'system.billing.compact_packages.read',
        },
        {
            id: 'plans',
            label: 'Planlar',
            path: '/admin/billing?tab=plans',
            permission: 'system.billing.plans.read',
        },
        {
            id: 'invoices',
            label: 'Fakturalar',
            path: '/admin/billing?tab=invoices',
            permission: 'system.billing.invoices.read',
        },
        {
            id: 'licenses',
            label: 'Lisenziyalar',
            path: '/admin/billing?tab=licenses',
            permission: 'system.billing.licenses.read',
        },
        ]
    },
    // 6. Approvals
    {
        id: 'approvals',
        label: 'Təsdiqləmələr',
        icon: 'CheckSquare',
        path: '/admin/approvals',
        permission: 'system.approvals.read',
    },
    // 7. File Manager
    {
        id: 'file_manager',
        label: 'Fayl Meneceri',
        icon: 'Folder',
        path: '/admin/files',
        permission: 'system.file_manager.read',
    },
    // 8. System Guide
    {
        id: 'system_guide',
        label: 'Sistem Bələdçisi',
        icon: 'BookOpen',
        path: '/admin/guide',
        permission: 'system.system_guide.read',
    },
    // 9. Settings
    {
        id: 'settings',
        label: 'Tənzimləmələr',
        icon: 'Settings',
        children: [{
            id: 'general',
            label: 'Ümumi',
            icon: 'Sliders',
            children: [{
                id: 'company_profile',
                label: 'Şirkət Profili',
                path: '/admin/settings?tab=general',
                permission: 'system.settings.general.company_profile.read'
            },
            {
                id: 'notification_engine',
                label: 'Bildiriş Mühərriki',
                path: '/admin/settings?tab=notifications',
                permission: 'system.settings.general.notification_engine.read'
            },
            ]
        },
        {
            id: 'communication',
            label: 'Kommunikasiya',
            icon: 'MessageSquare',
            children: [{
                id: 'smtp_email',
                label: 'SMTP Email',
                path: '/admin/settings?tab=smtp',
                permission: 'system.settings.communication.smtp_email.read'
            },
            {
                id: 'smtp_sms',
                label: 'SMS Gateway',
                path: '/admin/settings?tab=sms',
                permission: 'system.settings.communication.smtp_sms.read'
            },
            ]
        },
        {
            id: 'security_group',
            label: 'Təhlükəsizlik',
            icon: 'Shield',
            children: [{
                id: 'security',
                label: 'Siyasətlər (Policies)',
                path: '/admin/settings?tab=security',
                // SAP-GRADE: Permissionless container
                // permission: 'system.settings.security.security_policy.global_policy.read',
                children: [
                    { id: 'password', label: 'Şifrə Siyasəti', path: '/admin/settings?tab=security&subTab=password', permission: 'system.settings.security.security_policy.password.read' },
                    { id: 'login', label: 'Giriş Nəzarəti', path: '/admin/settings?tab=security&subTab=login', permission: 'system.settings.security.security_policy.login.read' },
                    { id: 'session', label: 'Sessiya', path: '/admin/settings?tab=security&subTab=session', permission: 'system.settings.security.security_policy.session.read' },
                    { id: 'restrictions', label: 'Qlobal Məhdudiyyətlər', path: '/admin/settings?tab=security&subTab=restrictions', permission: 'system.settings.security.security_policy.restrictions.read' }
                ]
            },
            {
                id: 'sso',
                label: 'SSO & OAuth',
                path: '/admin/settings?tab=sso',
                permission: 'system.settings.security.sso_OAuth.read'
            },
            {
                id: 'user_rights',
                label: 'İstifadəçi Hüquqları',
                // SAP-GRADE: Permissionless container
                // permission: 'system.settings.security.user_rights.role.read',
                children: [{
                    id: 'roles',
                    label: 'Rollar',
                    path: '/admin/settings?tab=user_rights&subTab=roles',
                    permission: 'system.settings.security.user_rights.roles.read'
                },
                {
                    id: 'matrix_view',
                    label: 'Matris',
                    path: '/admin/settings?tab=user_rights&subTab=matrix_view',
                    permission: 'system.settings.security.user_rights.matrix_view.read'
                },
                {
                    id: 'compliance',
                    label: 'Compliance',
                    path: '/admin/settings?tab=user_rights&subTab=compliance',
                    permission: 'system.settings.security.user_rights.compliance.read'
                }]
            },
            ]
        },
        {
            id: 'system_config',
            label: 'Sistem Konfiqurasiyası',
            icon: 'Database', // or Settings2
            children: [{
                id: 'billing_config',
                label: 'Bilinq parametrləri',
                // SAP-GRADE: Container is PERMISSIONLESS. Visibility from ANY child.
                icon: 'DollarSign',
                children: [{
                    id: 'pricing',
                    label: 'Qiymət Qaydaları',
                    path: '/admin/settings?tab=billing_config&subTab=pricing',
                    permission: 'system.settings.system_configurations.billing_configurations.pricing.read'
                },
                {
                    id: 'limits',
                    label: 'Limitlər',
                    path: '/admin/settings?tab=billing_config&subTab=limits',
                    permission: 'system.settings.system_configurations.billing_configurations.limits.read'
                },
                {
                    id: 'overuse',
                    label: 'Limit Aşıldıqda',
                    path: '/admin/settings?tab=billing_config&subTab=overuse',
                    permission: 'system.settings.system_configurations.billing_configurations.overuse.read'
                },
                {
                    id: 'grace',
                    label: 'Güzəşt Müddəti',
                    path: '/admin/settings?tab=billing_config&subTab=grace',
                    permission: 'system.settings.system_configurations.billing_configurations.grace.read'
                },
                {
                    id: 'currency',
                    label: 'Valyuta və Vergi',
                    path: '/admin/settings?tab=billing_config&subTab=currency',
                    permission: 'system.settings.system_configurations.billing_configurations.currency_tax.read'
                },
                {
                    id: 'invoice',
                    label: 'Faktura Qaydaları',
                    path: '/admin/settings?tab=billing_config&subTab=invoice',
                    permission: 'system.settings.system_configurations.billing_configurations.invoice.read'
                },
                {
                    id: 'events',
                    label: 'Hadisələr',
                    path: '/admin/settings?tab=billing_config&subTab=events',
                    permission: 'system.settings.system_configurations.billing_configurations.events.read'
                },
                {
                    id: 'security',
                    label: 'Giriş və Təhlükəsizlik',
                    path: '/admin/settings?tab=billing_config&subTab=security',
                    permission: 'system.settings.system_configurations.billing_configurations.security.read'
                }
                ]
            }, // Consolidated permission
            {
                id: 'dictionaries',
                label: 'Soraqçalar',
                icon: 'Book',
                children: [{
                    id: 'sectors',
                    label: 'Sektorlar',
                    path: '/admin/settings?tab=dictionaries&entity=sectors',
                    permission: 'system.settings.system_configurations.dictionary.sectors.read'
                },
                {
                    id: 'units',
                    label: 'Ölçü Vahidləri',
                    path: '/admin/settings?tab=dictionaries&entity=units',
                    permission: 'system.settings.system_configurations.dictionary.units.read'
                },
                {
                    id: 'currencies',
                    label: 'Valyutalar',
                    path: '/admin/settings?tab=dictionaries&entity=currencies',
                    permission: 'system.settings.system_configurations.dictionary.currencies.read'
                },
                {
                    id: 'time_zones',
                    label: 'Saat Qurşaqları',
                    path: '/admin/settings?tab=dictionaries&entity=time_zones',
                    permission: 'system.settings.system_configurations.dictionary.time_zones.read'
                },
                {
                    id: 'addresses',
                    label: 'Ünvanlar',
                    children: [{
                        id: 'country',
                        label: 'Ölkələr',
                        path: '/admin/settings?tab=dictionaries&entity=country',
                        permission: 'system.settings.system_configurations.dictionary.addresses.read_country'
                    },
                    {
                        id: 'city',
                        label: 'Şəhərlər',
                        path: '/admin/settings?tab=dictionaries&entity=city',
                        permission: 'system.settings.system_configurations.dictionary.addresses.read_city'
                    },
                    {
                        id: 'district',
                        label: 'Rayonlar',
                        path: '/admin/settings?tab=dictionaries&entity=district',
                        permission: 'system.settings.system_configurations.dictionary.addresses.read_district'
                    },
                    ]
                }
                ]
            },
            {
                id: 'templates',
                label: 'Sənəd Şablonları',
                path: '/admin/settings?tab=templates',
                permission: 'system.settings.system_configurations.document_templates.read'
            },
            {
                id: 'workflow',
                label: 'Workflow',
                path: '/admin/settings?tab=workflow',
                permission: 'system.settings.system_configurations.workflow.configuration.read',
                children: [
                    {
                        id: 'config',
                        label: 'Konfiqurasiya',
                        path: '/admin/settings?tab=workflow&subTab=config',
                        permission: 'system.settings.system_configurations.workflow.configuration.read'
                    },
                    {
                        id: 'monitor',
                        label: 'Monitorinq',
                        path: '/admin/settings?tab=workflow&subTab=monitor',
                        permission: 'system.settings.system_configurations.workflow.configuration.read'
                    }
                ]
            },
            ]
        }
        ]
    },
    // 10. System Console
    {
        id: 'system_console',
        label: 'Sistem Konsolu',
        icon: 'Terminal',
        children: [{
            id: 'console_dash',
            label: 'Dashboard',
            path: '/admin/console?tab=dashboard',
            permission: 'system.system_console.dashboard.read'
        },
        {
            id: 'monitoring',
            label: 'System Monitorinqi',
            path: '/admin/console?tab=monitoring',
            // Permissionless container (permissions are on children)
            children: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    path: '/admin/console?tab=monitoring&subTab=dashboard',
                    permission: 'system.system_console.monitoring.dashboard.read'
                },
                {
                    id: 'alerts',
                    label: 'Alert Rules',
                    path: '/admin/console?tab=monitoring&subTab=alerts',
                    permission: 'system.system_console.monitoring.dashboard.read'
                },
                {
                    id: 'anomalies',
                    label: 'Anomalies',
                    path: '/admin/console?tab=monitoring&subTab=anomalies',
                    permission: 'system.system_console.monitoring.dashboard.read'
                },
                {
                    id: 'logs',
                    label: 'Logs',
                    path: '/admin/console?tab=monitoring&subTab=logs',
                    permission: 'system.system_console.monitoring.dashboard.read'
                }
            ]
        },
        {
            id: 'audit',
            label: 'Audit & Compliance',
            path: '/admin/console?tab=audit',
            permission: 'system.system_console.audit_compliance.read'
        },
        {
            id: 'scheduler',
            label: 'Job Scheduler',
            path: '/admin/console?tab=scheduler',
            permission: 'system.system_console.job_scheduler.read'
        },
        {
            id: 'retention',
            label: 'Data Retention',
            path: '/admin/console?tab=retention',
            permission: 'system.system_console.data_retention.read'
        },
        {
            id: 'feature_flags',
            label: 'Feature Flags',
            path: '/admin/console?tab=feature_flags',
            permission: 'system.system_console.feature_flags.read'
        },
        // Added omitted items
        {
            id: 'policy_security',
            label: 'Policy Security',
            path: '/admin/console?tab=policy',
            permission: 'system.system_console.policy_security.read'
        },
        {
            id: 'feedback',
            label: 'Feedback',
            path: '/admin/console?tab=feedback',
            permission: 'system.system_console.feedback.read'
        },
        {
            id: 'tools',
            label: 'Tools',
            path: '/admin/console?tab=tools',
            permission: 'system.system_console.tools.read'
        },
        ]
    },
    // 11. Developer Hub
    {
        id: 'developer_hub',
        label: 'Developer Hub',
        icon: 'Code',
        children: [{
            id: 'api',
            label: 'API Reference',
            path: '/admin/developer?tab=api',
            permission: 'system.developer_hub.api_reference.read'
        },
        {
            id: 'sdk',
            label: 'SDKs',
            path: '/admin/developer?tab=sdk',
            permission: 'system.developer_hub.sdk.read'
        },
        {
            id: 'webhooks',
            label: 'Webhooks',
            path: '/admin/developer?tab=webhooks',
            permission: 'system.developer_hub.webhooks.read'
        },
        {
            id: 'perm_map',
            label: 'Permission Map',
            path: '/admin/developer?tab=permissions',
            permission: 'system.developer_hub.permission_map.read'
        },
        ]
    },
];