"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN_MENU_TREE = void 0;
exports.ADMIN_MENU_TREE = [
    {
        id: 'dashboard',
        label: 'İdarə etmə paneli',
        icon: 'LayoutDashboard',
        path: '/admin/dashboard',
        permission: 'system.dashboard.read',
    },
    {
        id: 'tenants',
        label: 'Tenantlar',
        icon: 'Building2',
        path: '/admin/tenants',
        permission: 'system.tenants.read',
    },
    {
        id: 'branches',
        label: 'Filiallar',
        icon: 'GitBranch',
        path: '/admin/branches',
        permission: 'system.branches.read',
    },
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
    {
        id: 'approvals',
        label: 'Təsdiqləmələr',
        icon: 'CheckSquare',
        path: '/admin/approvals',
        permission: 'system.approvals.read',
    },
    {
        id: 'file_manager',
        label: 'Fayl Meneceri',
        icon: 'Folder',
        path: '/admin/files',
        permission: 'system.file_manager.read',
    },
    {
        id: 'system_guide',
        label: 'Sistem Bələdçisi',
        icon: 'BookOpen',
        path: '/admin/guide',
        permission: 'system.system_guide.read',
    },
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
                id: 'security',
                label: 'Təhlükəsizlik',
                icon: 'Shield',
                children: [{
                        id: 'policies',
                        label: 'Siyasətlər (Policies)',
                        path: '/admin/settings?tab=security',
                        permission: 'system.settings.security.security_policy.global_policy.read'
                    },
                    {
                        id: 'sso',
                        label: 'SSO & OAuth',
                        path: '/admin/settings?tab=sso',
                        permission: 'system.settings.security.sso_OAuth.read'
                    },
                    {
                        id: 'rights',
                        label: 'İstifadəçi Hüquqları',
                        path: '/admin/settings?tab=roles',
                        permission: 'system.settings.security.user_rights.role.read'
                    },
                ]
            },
            {
                id: 'system_config',
                label: 'Sistem Konfiqurasiyası',
                icon: 'Database',
                children: [{
                        id: 'billing_config',
                        label: 'Bilinq Ayarları',
                        path: '/admin/settings?tab=billing_config',
                        permission: 'system.settings.system_configurations.billing_configurations.price_rules.read'
                    },
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
                        permission: 'system.settings.system_configurations.workflow.configuration.read'
                    },
                ]
            }
        ]
    },
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
                label: 'Monitoring',
                path: '/admin/console?tab=monitoring',
                permission: 'system.system_console.monitoring.dashboard.read'
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
//# sourceMappingURL=menu.definition.js.map