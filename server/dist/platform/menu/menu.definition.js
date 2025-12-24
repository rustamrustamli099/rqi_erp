"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN_MENU_TREE = void 0;
const perms_1 = require("../../common/constants/perms");
exports.ADMIN_MENU_TREE = [
    {
        id: 'dashboard',
        label: 'İdarə etmə paneli',
        icon: 'LayoutDashboard',
        path: '/admin/dashboard',
        permission: perms_1.PERMISSIONS.dashboard.view,
    },
    {
        id: 'tenants',
        label: 'Tenantlar',
        icon: 'Building2',
        path: '/admin/tenants',
        permission: perms_1.PERMISSIONS.tenants.view,
    },
    {
        id: 'branches',
        label: 'Filiallar',
        icon: 'GitBranch',
        path: '/admin/branches',
        permission: perms_1.PERMISSIONS.branches.view,
    },
    {
        id: 'users_group',
        label: 'İstifadəçilər',
        icon: 'Users',
        children: [{
                id: 'users',
                label: 'İstifadəçilər',
                path: '/admin/users?tab=users',
                permission: perms_1.PERMISSIONS.users.users.view,
            },
            {
                id: 'curators',
                label: 'Kuratorlar',
                path: '/admin/users?tab=curators',
                permission: perms_1.PERMISSIONS.users.curators.view,
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
                permission: perms_1.PERMISSIONS.billing.market_place.view,
            },
            {
                id: 'compact_packages',
                label: 'Kompakt Paketlər',
                path: '/admin/billing?tab=compact_packages',
                permission: perms_1.PERMISSIONS.billing.compact_packages.view,
            },
            {
                id: 'plans',
                label: 'Planlar',
                path: '/admin/billing?tab=plans',
                permission: perms_1.PERMISSIONS.billing.plans.view,
            },
            {
                id: 'invoices',
                label: 'Fakturalar',
                path: '/admin/billing?tab=invoices',
                permission: perms_1.PERMISSIONS.billing.invoices.view,
            },
            {
                id: 'licenses',
                label: 'Lisenziyalar',
                path: '/admin/billing?tab=licenses',
                permission: perms_1.PERMISSIONS.billing.licenses.view,
            },
        ]
    },
    {
        id: 'approvals',
        label: 'Təsdiqləmələr',
        icon: 'CheckSquare',
        path: '/admin/approvals',
        permission: perms_1.PERMISSIONS.approvals.view,
    },
    {
        id: 'file_manager',
        label: 'Fayl Meneceri',
        icon: 'Folder',
        path: '/admin/files',
        permission: perms_1.PERMISSIONS.file_manager.view,
    },
    {
        id: 'system_guide',
        label: 'Sistem Bələdçisi',
        icon: 'BookOpen',
        path: '/admin/guide',
        permission: perms_1.PERMISSIONS.system_guide.view,
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
                        permission: perms_1.PERMISSIONS.settings.general.company_profile.view
                    },
                    {
                        id: 'notification_engine',
                        label: 'Bildiriş Mühərriki',
                        path: '/admin/settings?tab=notifications',
                        permission: perms_1.PERMISSIONS.settings.general.notification_engine.view
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
                        permission: perms_1.PERMISSIONS.settings.communication.smtp_email.view
                    },
                    {
                        id: 'smtp_sms',
                        label: 'SMS Gateway',
                        path: '/admin/settings?tab=sms',
                        permission: perms_1.PERMISSIONS.settings.communication.smtp_sms.view
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
                        permission: perms_1.PERMISSIONS.settings.security.security_policy.global_policy.view
                    },
                    {
                        id: 'sso',
                        label: 'SSO & OAuth',
                        path: '/admin/settings?tab=sso',
                        permission: perms_1.PERMISSIONS.settings.security.sso_OAuth.view
                    },
                    {
                        id: 'rights',
                        label: 'İstifadəçi Hüquqları',
                        path: '/admin/settings?tab=roles',
                        permission: perms_1.PERMISSIONS.settings.security.user_rights.role.view
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
                        permission: perms_1.PERMISSIONS.settings.system_configurations.billing_configurations.price_rules.view
                    },
                    {
                        id: 'dictionaries',
                        label: 'Soraqçalar',
                        icon: 'Book',
                        children: [{
                                id: 'sectors',
                                label: 'Sektorlar',
                                path: '/admin/settings?tab=dictionaries&entity=sectors',
                                permission: perms_1.PERMISSIONS.settings.system_configurations.dictionary.sectors.view
                            },
                            {
                                id: 'units',
                                label: 'Ölçü Vahidləri',
                                path: '/admin/settings?tab=dictionaries&entity=units',
                                permission: perms_1.PERMISSIONS.settings.system_configurations.dictionary.units.view
                            },
                            {
                                id: 'currencies',
                                label: 'Valyutalar',
                                path: '/admin/settings?tab=dictionaries&entity=currencies',
                                permission: perms_1.PERMISSIONS.settings.system_configurations.dictionary.currencies.view
                            },
                            {
                                id: 'time_zones',
                                label: 'Saat Qurşaqları',
                                path: '/admin/settings?tab=dictionaries&entity=time_zones',
                                permission: perms_1.PERMISSIONS.settings.system_configurations.dictionary.time_zones.view
                            },
                            {
                                id: 'addresses',
                                label: 'Ünvanlar',
                                children: [{
                                        id: 'country',
                                        label: 'Ölkələr',
                                        path: '/admin/settings?tab=dictionaries&entity=country',
                                        permission: perms_1.PERMISSIONS.settings.system_configurations.dictionary.addresses.read_country
                                    },
                                    {
                                        id: 'city',
                                        label: 'Şəhərlər',
                                        path: '/admin/settings?tab=dictionaries&entity=city',
                                        permission: perms_1.PERMISSIONS.settings.system_configurations.dictionary.addresses.read_city
                                    },
                                    {
                                        id: 'district',
                                        label: 'Rayonlar',
                                        path: '/admin/settings?tab=dictionaries&entity=district',
                                        permission: perms_1.PERMISSIONS.settings.system_configurations.dictionary.addresses.read_district
                                    },
                                ]
                            }
                        ]
                    },
                    {
                        id: 'templates',
                        label: 'Sənəd Şablonları',
                        path: '/admin/settings?tab=templates',
                        permission: perms_1.PERMISSIONS.settings.system_configurations.document_templates.view
                    },
                    {
                        id: 'workflow',
                        label: 'Workflow',
                        path: '/admin/settings?tab=workflow',
                        permission: perms_1.PERMISSIONS.settings.system_configurations.workflow.configuration.view
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
                permission: perms_1.PERMISSIONS.system_console.dashboard.view
            },
            {
                id: 'monitoring',
                label: 'Monitoring',
                path: '/admin/console?tab=monitoring',
                permission: perms_1.PERMISSIONS.system_console.monitoring.dashboard.view
            },
            {
                id: 'audit',
                label: 'Audit & Compliance',
                path: '/admin/console?tab=audit',
                permission: perms_1.PERMISSIONS.system_console.audit_compliance.view
            },
            {
                id: 'scheduler',
                label: 'Job Scheduler',
                path: '/admin/console?tab=scheduler',
                permission: perms_1.PERMISSIONS.system_console.job_scheduler.view
            },
            {
                id: 'retention',
                label: 'Data Retention',
                path: '/admin/console?tab=retention',
                permission: perms_1.PERMISSIONS.system_console.data_retention.view
            },
            {
                id: 'feature_flags',
                label: 'Feature Flags',
                path: '/admin/console?tab=feature_flags',
                permission: perms_1.PERMISSIONS.system_console.feature_flags.view
            },
            {
                id: 'policy_security',
                label: 'Policy Security',
                path: '/admin/console?tab=policy',
                permission: perms_1.PERMISSIONS.system_console.policy_security.view
            },
            {
                id: 'feedback',
                label: 'Feedback',
                path: '/admin/console?tab=feedback',
                permission: perms_1.PERMISSIONS.system_console.feedback.view
            },
            {
                id: 'tools',
                label: 'Tools',
                path: '/admin/console?tab=tools',
                permission: perms_1.PERMISSIONS.system_console.tools.view
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
                permission: perms_1.PERMISSIONS.developer_hub.api_reference.view
            },
            {
                id: 'sdk',
                label: 'SDKs',
                path: '/admin/developer?tab=sdk',
                permission: perms_1.PERMISSIONS.developer_hub.sdk.view
            },
            {
                id: 'webhooks',
                label: 'Webhooks',
                path: '/admin/developer?tab=webhooks',
                permission: perms_1.PERMISSIONS.developer_hub.webhooks.view
            },
            {
                id: 'perm_map',
                label: 'Permission Map',
                path: '/admin/developer?tab=permissions',
                permission: perms_1.PERMISSIONS.developer_hub.permission_map.view
            },
        ]
    },
];
//# sourceMappingURL=menu.definition.js.map