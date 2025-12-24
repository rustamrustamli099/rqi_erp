
import {
    PERMISSIONS
} from '../../common/constants/perms';

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
        permission: PERMISSIONS.dashboard.view,
    },
    // 2. Tenants
    {
        id: 'tenants',
        label: 'Tenantlar',
        icon: 'Building2',
        path: '/admin/tenants',
        permission: PERMISSIONS.tenants.view,
    },
    // 3. Branches
    {
        id: 'branches',
        label: 'Filiallar',
        icon: 'GitBranch',
        path: '/admin/branches',
        permission: PERMISSIONS.branches.view,
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
            permission: PERMISSIONS.users.users.view,
        },
        {
            id: 'curators',
            label: 'Kuratorlar',
            path: '/admin/users?tab=curators',
            permission: PERMISSIONS.users.curators.view,
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
            permission: PERMISSIONS.billing.market_place.view,
        },
        {
            id: 'compact_packages',
            label: 'Kompakt Paketlər',
            path: '/admin/billing?tab=compact_packages',
            permission: PERMISSIONS.billing.compact_packages.view,
        },
        {
            id: 'plans',
            label: 'Planlar',
            path: '/admin/billing?tab=plans',
            permission: PERMISSIONS.billing.plans.view,
        },
        {
            id: 'invoices',
            label: 'Fakturalar',
            path: '/admin/billing?tab=invoices',
            permission: PERMISSIONS.billing.invoices.view,
        },
        {
            id: 'licenses',
            label: 'Lisenziyalar',
            path: '/admin/billing?tab=licenses',
            permission: PERMISSIONS.billing.licenses.view,
        },
        ]
    },
    // 6. Approvals
    {
        id: 'approvals',
        label: 'Təsdiqləmələr',
        icon: 'CheckSquare',
        path: '/admin/approvals',
        permission: PERMISSIONS.approvals.view,
    },
    // 7. File Manager
    {
        id: 'file_manager',
        label: 'Fayl Meneceri',
        icon: 'Folder',
        path: '/admin/files',
        permission: PERMISSIONS.file_manager.view,
    },
    // 8. System Guide
    {
        id: 'system_guide',
        label: 'Sistem Bələdçisi',
        icon: 'BookOpen',
        path: '/admin/guide',
        permission: PERMISSIONS.system_guide.view,
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
                permission: PERMISSIONS.settings.general.company_profile.view
            },
            {
                id: 'notification_engine',
                label: 'Bildiriş Mühərriki',
                path: '/admin/settings?tab=notifications',
                permission: PERMISSIONS.settings.general.notification_engine.view
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
                permission: PERMISSIONS.settings.communication.smtp_email.view
            },
            {
                id: 'smtp_sms',
                label: 'SMS Gateway',
                path: '/admin/settings?tab=sms',
                permission: PERMISSIONS.settings.communication.smtp_sms.view
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
                permission: PERMISSIONS.settings.security.security_policy.global_policy.view
            },
            {
                id: 'sso',
                label: 'SSO & OAuth',
                path: '/admin/settings?tab=sso',
                permission: PERMISSIONS.settings.security.sso_OAuth.view
            },
            {
                id: 'rights',
                label: 'İstifadəçi Hüquqları',
                path: '/admin/settings?tab=roles',
                permission: PERMISSIONS.settings.security.user_rights.role.view
            },
            ]
        },
        {
            id: 'system_config',
            label: 'Sistem Konfiqurasiyası',
            icon: 'Database', // or Settings2
            children: [{
                id: 'billing_config',
                label: 'Bilinq Ayarları',
                path: '/admin/settings?tab=billing_config',
                permission: PERMISSIONS.settings.system_configurations.billing_configurations.price_rules.view
            }, // Consolidated permission
            {
                id: 'dictionaries',
                label: 'Soraqçalar',
                icon: 'Book',
                children: [{
                    id: 'sectors',
                    label: 'Sektorlar',
                    path: '/admin/settings?tab=dictionaries&entity=sectors',
                    permission: PERMISSIONS.settings.system_configurations.dictionary.sectors.view
                },
                {
                    id: 'units',
                    label: 'Ölçü Vahidləri',
                    path: '/admin/settings?tab=dictionaries&entity=units',
                    permission: PERMISSIONS.settings.system_configurations.dictionary.units.view
                },
                {
                    id: 'currencies',
                    label: 'Valyutalar',
                    path: '/admin/settings?tab=dictionaries&entity=currencies',
                    permission: PERMISSIONS.settings.system_configurations.dictionary.currencies.view
                },
                {
                    id: 'time_zones',
                    label: 'Saat Qurşaqları',
                    path: '/admin/settings?tab=dictionaries&entity=time_zones',
                    permission: PERMISSIONS.settings.system_configurations.dictionary.time_zones.view
                },
                {
                    id: 'addresses',
                    label: 'Ünvanlar',
                    children: [{
                        id: 'country',
                        label: 'Ölkələr',
                        path: '/admin/settings?tab=dictionaries&entity=country',
                        permission: PERMISSIONS.settings.system_configurations.dictionary.addresses.read_country
                    },
                    {
                        id: 'city',
                        label: 'Şəhərlər',
                        path: '/admin/settings?tab=dictionaries&entity=city',
                        permission: PERMISSIONS.settings.system_configurations.dictionary.addresses.read_city
                    },
                    {
                        id: 'district',
                        label: 'Rayonlar',
                        path: '/admin/settings?tab=dictionaries&entity=district',
                        permission: PERMISSIONS.settings.system_configurations.dictionary.addresses.read_district
                    },
                    ]
                }
                ]
            },
            {
                id: 'templates',
                label: 'Sənəd Şablonları',
                path: '/admin/settings?tab=templates',
                permission: PERMISSIONS.settings.system_configurations.document_templates.view
            },
            {
                id: 'workflow',
                label: 'Workflow',
                path: '/admin/settings?tab=workflow',
                permission: PERMISSIONS.settings.system_configurations.workflow.configuration.view
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
            permission: PERMISSIONS.system_console.dashboard.view
        },
        {
            id: 'monitoring',
            label: 'Monitoring',
            path: '/admin/console?tab=monitoring',
            permission: PERMISSIONS.system_console.monitoring.dashboard.view
        },
        {
            id: 'audit',
            label: 'Audit & Compliance',
            path: '/admin/console?tab=audit',
            permission: PERMISSIONS.system_console.audit_compliance.view
        },
        {
            id: 'scheduler',
            label: 'Job Scheduler',
            path: '/admin/console?tab=scheduler',
            permission: PERMISSIONS.system_console.job_scheduler.view
        },
        {
            id: 'retention',
            label: 'Data Retention',
            path: '/admin/console?tab=retention',
            permission: PERMISSIONS.system_console.data_retention.view
        },
        {
            id: 'feature_flags',
            label: 'Feature Flags',
            path: '/admin/console?tab=feature_flags',
            permission: PERMISSIONS.system_console.feature_flags.view
        },
        // Added omitted items
        {
            id: 'policy_security',
            label: 'Policy Security',
            path: '/admin/console?tab=policy',
            permission: PERMISSIONS.system_console.policy_security.view
        },
        {
            id: 'feedback',
            label: 'Feedback',
            path: '/admin/console?tab=feedback',
            permission: PERMISSIONS.system_console.feedback.view
        },
        {
            id: 'tools',
            label: 'Tools',
            path: '/admin/console?tab=tools',
            permission: PERMISSIONS.system_console.tools.view
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
            permission: PERMISSIONS.developer_hub.api_reference.view
        },
        {
            id: 'sdk',
            label: 'SDKs',
            path: '/admin/developer?tab=sdk',
            permission: PERMISSIONS.developer_hub.sdk.view
        },
        {
            id: 'webhooks',
            label: 'Webhooks',
            path: '/admin/developer?tab=webhooks',
            permission: PERMISSIONS.developer_hub.webhooks.view
        },
        {
            id: 'perm_map',
            label: 'Permission Map',
            path: '/admin/developer?tab=permissions',
            permission: PERMISSIONS.developer_hub.permission_map.view
        },
        ]
    },
];