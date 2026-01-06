// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// COMPLETE SLUGS - USER_RIGHTS WITH NEW SUBTABS
const SYSTEM_SLUGS = {
    DASHBOARD: { READ: 'system.dashboard.read' },
    TENANTS: {
        READ: 'system.tenants.read',
        CREATE: 'system.tenants.create',
        UPDATE: 'system.tenants.update',
        DELETE: 'system.tenants.delete',
        IMPERSONATE: 'system.tenants.impersonate',
        EXPORT: 'system.tenants.export_to_excel',
        // Granular Permissions (Phase 14G Refinement)
        MANAGE_USERS: 'system.tenants.manage_users',
        MANAGE_SECURITY: 'system.tenants.manage_security',
        MANAGE_BILLING: 'system.tenants.manage_billing',
        MANAGE_FEATURES: 'system.tenants.manage_features', // Modules, Limits
        MANAGE_CONTRACT: 'system.tenants.manage_contract', // Suspend, Terminate, Restrictions
        VIEW_AUDIT: 'system.tenants.view_audit',
        // MANAGE legacy removal - using granular instead
    },
    // Updated Branches to match permissionsStructure
    BRANCHES: {
        READ: 'system.branches.read',
        CREATE: 'system.branches.create',
        UPDATE: 'system.branches.update',
        DELETE: 'system.branches.delete',
        EXPORT_TO_EXCEL: 'system.branches.export_to_excel',
        READ_DETAILS: 'system.branches.read_details',
        CHANGE_STATUS: 'system.branches.change_status'
    },
    // Missing APPROVALS section added
    APPROVALS: {
        READ: 'system.approvals.read',
        FORWARD: 'system.approvals.forward',
        REJECT: 'system.approvals.reject',
        EXPORT_TO_EXCEL: 'system.approvals.export_to_excel',
        APPROVE: 'system.approvals.approve',
    },
    USERS: {
        READ: 'system.users.users.read',
        CREATE: 'system.users.users.create',
        UPDATE: 'system.users.users.update',
        DELETE: 'system.users.users.delete',
        INVITE: 'system.users.users.invite',
        CONNECT_TO_EMPLOYEE: 'system.users.users.connect_to_employee',
        // Synced with permission-structure.ts
        EXPORT_TO_EXCEL: 'system.users.users.export_to_excel',
        CHANGE_STATUS: 'system.users.users.change_status',
        // Row-level actions (Phase 14G)
        IMPERSONATE: 'system.users.users.impersonate',
        SEND_INVITE: 'system.users.users.send_invite',
        MANAGE_RESTRICTIONS: 'system.users.users.manage_restrictions'
    },
    CURATORS: {
        READ: 'system.users.curators.read',
        CREATE: 'system.users.curators.create',
        UPDATE: 'system.users.curators.update',
        DELETE: 'system.users.curators.delete',
        // Synced with permission-structure.ts
        CHANGE_STATUS: 'system.users.curators.change_status',
        COPY_ID: 'system.users.curators.copy_id'
    },
    FILE_MANAGER: {
        READ: 'system.file_manager.read',
        CREATE_FOLDER: 'system.file_manager.create_folder',
        UPLOAD: 'system.file_manager.upload',
        DELETE_FILE: 'system.file_manager.delete_file',
        RENAME_FOLDER: 'system.file_manager.rename_folder',
        MOVE_FOLDER: 'system.file_manager.move_folder',
        SHARE_FOLDER: 'system.file_manager.share_folder',
        PERMISSIONS_CONFIGURATION: 'system.file_manager.permissions_configuration',
        DELETE_FOLDER: 'system.file_manager.delete_folder',
        RENAME_FILE: 'system.file_manager.rename_file',
        MOVE_FILE: 'system.file_manager.move_file',
        COPY_FILE: 'system.file_manager.copy_file',
        SHARE_FILE: 'system.file_manager.share_file',
        VERSION: 'system.file_manager.version'
    },
    SYSTEM_GUIDE: {
        READ: 'system.system_guide.read',
        CREATE: 'system.system_guide.create',
        UPDATE: 'system.system_guide.update',
        DELETE: 'system.system_guide.delete',
        SHARE: 'system.system_guide.share',
        EDIT: 'system.system_guide.edit',
        PUBLISH: 'system.system_guide.publish'
    },

    // USER RIGHTS - NEW SEPARATED SUBTABS
    USER_RIGHTS: {
        ROLES: {
            READ: 'system.settings.security.user_rights.roles.read',
            CREATE: 'system.settings.security.user_rights.roles.create',
            UPDATE: 'system.settings.security.user_rights.roles.update',
            DELETE: 'system.settings.security.user_rights.roles.delete',
            EXPORT_TO_EXCEL: 'system.settings.security.user_rights.roles.export_to_excel',
            MANAGE_PERMISSIONS: 'system.settings.security.user_rights.roles.manage_permissions',
            CHANGE_STATUS: 'system.settings.security.user_rights.roles.change_status',
            COPY: 'system.settings.security.user_rights.roles.copy',
            VIEW_AUDIT_LOG: 'system.settings.security.user_rights.roles.view_audit_log',
            SUBMIT: 'system.settings.security.user_rights.roles.submit',
        },
        MATRIX_VIEW: {
            READ: 'system.settings.security.user_rights.matrix_view.read',
            UPDATE: 'system.settings.security.user_rights.matrix_view.update',
        },
        COMPLIANCE: {
            READ: 'system.settings.security.user_rights.compliance.read',
            DOWNLOAD_REPORT: 'system.settings.security.user_rights.compliance.download_report',
            GENERATE_EVIDENCE: 'system.settings.security.user_rights.compliance.generate_evidence',
            DOWNLOAD_JSON_SOC2: 'system.settings.security.user_rights.compliance.download_json_soc2',
            DOWNLOAD_JSON_ISO: 'system.settings.security.user_rights.compliance.download_json_iso'
        }
    },

    AUDIT: { READ: 'system.audit_logs.read', EXPORT: 'system.audit_logs.export' },
    SETTINGS: {
        READ: 'system.settings.read', UPDATE: 'system.settings.update',
        GENERAL: {
            READ: 'system.settings.general.read',
            UPDATE: 'system.settings.general.update',
            COMPANY_PROFILE: 'system.settings.general.company_profile.read',
            NOTIFICATIONS: 'system.settings.general.notification_engine.read'
        },
        COMMUNICATION: {
            READ: 'system.settings.communication.read',
            MANAGE: 'system.settings.communication.update',
            SMTP_EMAIL: 'system.settings.communication.smtp_email.read',
            SMTP_SMS: 'system.settings.communication.smtp_sms.read'
        },
        SECURITY: {
            READ: 'system.settings.security.read',
            MANAGE: 'system.settings.security.update',
            // SECURITY POLICY SUB-TABS (SAP-GRADE)
            SECURITY_POLICY: {
                PASSWORD: {
                    READ: 'system.settings.security.security_policy.password.read',
                    UPDATE: 'system.settings.security.security_policy.password.update',
                },
                LOGIN: {
                    READ: 'system.settings.security.security_policy.login.read',
                    UPDATE: 'system.settings.security.security_policy.login.update',
                },
                SESSION: {
                    READ: 'system.settings.security.security_policy.session.read',
                    UPDATE: 'system.settings.security.security_policy.session.update',
                },
                RESTRICTIONS: {
                    READ: 'system.settings.security.security_policy.restrictions.read',
                    CREATE: 'system.settings.security.security_policy.restrictions.create',
                    UPDATE: 'system.settings.security.security_policy.restrictions.update',
                    DELETE: 'system.settings.security.security_policy.restrictions.delete',
                }
            },
            SSO_OAUTH: 'system.settings.security.sso_OAuth.read'
        },
        CONFIG: {
            READ: 'system.settings.system_configurations.read',
            MANAGE: 'system.settings.system_configurations.update',
            BILLING: {
                PRICING: 'system.settings.system_configurations.billing_configurations.pricing.read',
                LIMITS: 'system.settings.system_configurations.billing_configurations.limits.read',
                OVERUSE: 'system.settings.system_configurations.billing_configurations.overuse.read',
                GRACE: 'system.settings.system_configurations.billing_configurations.grace.read',
                CURRENCY_TAX: 'system.settings.system_configurations.billing_configurations.currency_tax.read',
                INVOICE: 'system.settings.system_configurations.billing_configurations.invoice.read',
                EVENTS: 'system.settings.system_configurations.billing_configurations.events.read',
                SECURITY: 'system.settings.system_configurations.billing_configurations.security.read'
            },
            DICTIONARIES: {
                READ: 'system.settings.system_configurations.dictionary.read',
                SECTORS: 'system.settings.system_configurations.dictionary.sectors.read',
                UNITS: 'system.settings.system_configurations.dictionary.units.read',
                CURRENCIES: 'system.settings.system_configurations.dictionary.currencies.read',
                TIME_ZONES: 'system.settings.system_configurations.dictionary.time_zones.read',
                ADDRESSES: {
                    READ_COUNTRY: 'system.settings.system_configurations.dictionary.addresses.read_country',
                    READ_CITY: 'system.settings.system_configurations.dictionary.addresses.read_city',
                    READ_DISTRICT: 'system.settings.system_configurations.dictionary.addresses.read_district'
                }
            },
            TEMPLATES: {
                READ: 'system.settings.system_configurations.document_templates.read',
                CONFIGURATE: 'system.settings.system_configurations.document_templates.configurate',
                UPDATE: 'system.settings.system_configurations.document_templates.update',
                SET_DEFAULT: 'system.settings.system_configurations.document_templates.set_default',
                DOWNLOAD: 'system.settings.system_configurations.document_templates.download',
                DELETE: 'system.settings.system_configurations.document_templates.delete',
                EXPORT: 'system.settings.system_configurations.document_templates.export_to_excel',
                CREATE: 'system.settings.system_configurations.document_templates.create'
            },
            WORKFLOW: {
                CONFIG: {
                    READ: 'system.settings.system_configurations.workflow.configuration.read',
                    CREATE: 'system.settings.system_configurations.workflow.configuration.create',
                    UPDATE: 'system.settings.system_configurations.workflow.configuration.update'
                },
                CONTROL: {
                    READ: 'system.settings.system_configurations.workflow.control.read',
                    REFRESH: 'system.settings.system_configurations.workflow.control.refresh',
                    DETAILS: 'system.settings.system_configurations.workflow.control.read_details',
                    LOGS: 'system.settings.system_configurations.workflow.control.logs',
                    APPROVE: 'system.settings.system_configurations.workflow.control.approve',
                    REJECT: 'system.settings.system_configurations.workflow.control.reject',
                    DELEGATE: 'system.settings.system_configurations.workflow.control.delegate',
                    ESCALATE: 'system.settings.system_configurations.workflow.control.escalate',
                    CANCEL: 'system.settings.system_configurations.workflow.control.cancel_process'
                }
            }
        }
    },
    BILLING: {
        READ: 'system.billing.read',
        MARKETPLACE: {
            READ: 'system.billing.market_place.read',
            CREATE: 'system.billing.market_place.create',
            UPDATE: 'system.billing.market_place.update',
            DELETE: 'system.billing.market_place.delete',
            CHANGE_STATUS: 'system.billing.market_place.change_status',
            EXPORT_TO_EXCEL: 'system.billing.market_place.export_to_excel'
        },
        PACKAGES: {
            READ: 'system.billing.compact_packages.read',
            CREATE: 'system.billing.compact_packages.create',
            UPDATE: 'system.billing.compact_packages.update',
            DELETE: 'system.billing.compact_packages.delete',
            CHANGE_STATUS: 'system.billing.compact_packages.change_status',
            EXPORT_TO_EXCEL: 'system.billing.compact_packages.export_to_excel'
        },
        PLANS: {
            READ: 'system.billing.plans.read',
            CREATE: 'system.billing.plans.create',
            UPDATE: 'system.billing.plans.update',
            DELETE: 'system.billing.plans.delete',
            CHANGE_STATUS: 'system.billing.plans.change_status',
            EXPORT_TO_EXCEL: 'system.billing.plans.export_to_excel'
        },
        INVOICES: {
            READ: 'system.billing.invoices.read',
            DOWNLOAD: 'system.billing.invoices.download',
            RESEND: 'system.billing.invoices.resend',
            VOID: 'system.billing.invoices.void',
            PAY: 'system.billing.invoices.pay',
            EXPORT_TO_EXCEL: 'system.billing.invoices.export_to_excel'
        },
        LICENSES: {
            READ: 'system.billing.licenses.read',
            CHANGE_PLAN: 'system.billing.licenses.change_plan',
            MANAGE_SEATS: 'system.billing.licenses.manage_seats',
            CANCEL: 'system.billing.licenses.cancel',
            VIEW_AUDIT: 'system.billing.licenses.view_audit'
        }
    },
    SETTINGS: {
        READ: 'system.settings.read',
        UPDATE: 'system.settings.update',
        GENERAL: {
            // Flattened/Shortened structure in seed can be expanded, but we must match the slugs exactly.
            // Using nested structure for clarity and matching permission-slugs.ts hierarchy
            COMPANY_PROFILE: {
                READ: 'system.settings.general.company_profile.read',
                UPDATE: 'system.settings.general.company_profile.update',
            },
            NOTIFICATION_ENGINE: {
                READ: 'system.settings.general.notification_engine.read',
                CREATE: 'system.settings.general.notification_engine.create',
                UPDATE: 'system.settings.general.notification_engine.update',
                DELETE: 'system.settings.general.notification_engine.delete',
                EXPORT: 'system.settings.general.notification_engine.export_to_excel',
                CHANGE_STATUS: 'system.settings.general.notification_engine.change_status',
                COPY: 'system.settings.general.notification_engine.copy_json',
            }
        },
        SECURITY: {
            READ: 'system.settings.security.read',
            MANAGE: 'system.settings.security.update',
            SECURITY_POLICY: {
                PASSWORD: {
                    READ: 'system.settings.security.security_policy.password.read',
                    UPDATE: 'system.settings.security.security_policy.password.update',
                },
                LOGIN: {
                    READ: 'system.settings.security.security_policy.login.read',
                    UPDATE: 'system.settings.security.security_policy.login.update',
                },
                SESSION: {
                    READ: 'system.settings.security.security_policy.session.read',
                    UPDATE: 'system.settings.security.security_policy.session.update',
                },
                RESTRICTIONS: {
                    READ: 'system.settings.security.security_policy.restrictions.read',
                    CREATE: 'system.settings.security.security_policy.restrictions.create',
                    UPDATE: 'system.settings.security.security_policy.restrictions.update',
                    DELETE: 'system.settings.security.security_policy.restrictions.delete',
                    CHANGE_STATUS: 'system.settings.security.security_policy.restrictions.change_status',
                    EXPORT_TO_EXCEL: 'system.settings.security.security_policy.restrictions.export_to_excel',
                },
            },
            SSO_OAUTH: {
                READ: 'system.settings.security.sso_oauth.read',
                CREATE: 'system.settings.security.sso_oauth.create',
                UPDATE: 'system.settings.security.sso_oauth.update',
                DELETE: 'system.settings.security.sso_oauth.delete',
                CHANGE_STATUS: 'system.settings.security.sso_oauth.change_status',
                TEST_CONNECTION: 'system.settings.security.sso_oauth.test_connection',
                EXPORT_TO_EXCEL: 'system.settings.security.sso_oauth.export_to_excel',
            },
        },
        COMMUNICATION: {
            READ: 'system.settings.communication.read',
            SMTP_EMAIL: {
                READ: 'system.settings.communication.smtp_email.read',
                UPDATE: 'system.settings.communication.smtp_email.update',
                SEND_TEST: 'system.settings.communication.smtp_email.send_test',
                CHANGE_STATUS: 'system.settings.communication.smtp_email.change_status',
            },
            SMTP_SMS: {
                READ: 'system.settings.communication.smtp_sms.read',
                UPDATE: 'system.settings.communication.smtp_sms.update',
                SEND_TEST: 'system.settings.communication.smtp_sms.send_test',
                CHANGE_STATUS: 'system.settings.communication.smtp_sms.change_status',
            },
        }
    },
    CONSOLE: {
        READ: 'system.system_console.read',
        DASHBOARD: 'system.system_console.dashboard.read',
        MONITORING: {
            DASHBOARD: 'system.system_console.monitoring.dashboard.read',
            ALERT_RULES: 'system.system_console.monitoring.alert_rules.read',
            ANOMALY_DETECTION: 'system.system_console.monitoring.anomaly_detection.read',
            SYSTEM_LOGS: 'system.system_console.monitoring.system_logs.read'
        },
        AUDIT: { READ: 'system.system_console.audit_compliance.read', MANAGE: 'system.system_console.audit_compliance.export_to_excel' },
        SCHEDULER: { READ: 'system.system_console.job_scheduler.read', EXECUTE: 'system.system_console.job_scheduler.execute' },
        RETENTION: { READ: 'system.system_console.data_retention.read', MANAGE: 'system.system_console.data_retention.manage' },
        FEATURES: { READ: 'system.system_console.feature_flags.read', MANAGE: 'system.system_console.feature_flags.manage' },
        POLICY: 'system.system_console.policy_security.read',
        FEEDBACK: 'system.system_console.feedback.read',
        TOOLS: { READ: 'system.system_console.tools.read', EXECUTE: 'system.system_console.tools.execute' }
    },
    DEVELOPER: { READ: 'system.developer_hub.read', API: 'system.developer_hub.api_reference.read', SDK: 'system.developer_hub.sdk.read', WEBHOOKS: { READ: 'system.developer_hub.webhooks.read', MANAGE: 'system.developer_hub.webhooks.send_test_payload' }, PERM_MAP: 'system.developer_hub.permission_map.read' },
    FILES: { READ: 'system.file_manager.read', UPLOAD: 'system.file_manager.upload', DELETE: 'system.file_manager.delete_file' },
    GUIDE: { READ: 'system.system_guide.read', EDIT: 'system.system_guide.edit', MANAGE: 'system.system_guide.create' },
    APPROVALS: { READ: 'system.approvals.read', APPROVE: 'system.approvals.approve' }
};

const TENANT_SLUGS = {
    DASHBOARD: { READ: 'tenant.dashboard.read' },
    USERS: { READ: 'tenant.users.read', CREATE: 'tenant.users.create', MANAGE: 'tenant.users.update' },
    ROLES: { READ: 'tenant.roles.read', CREATE: 'tenant.roles.create', UPDATE: 'tenant.roles.update', DELETE: 'tenant.roles.delete' },
    MATRIX_VIEW: { READ: 'tenant.matrix_view.read', UPDATE: 'tenant.matrix_view.update' },
    SETTINGS: { READ: 'tenant.settings.read', UPDATE: 'tenant.settings.update', MANAGE: 'tenant.settings.update' },
    BILLING: { READ: 'tenant.billing.read', PAY: 'tenant.billing.pay_invoice' },
    REPORTS: { READ: 'tenant.reports.read', EXPORT: 'tenant.reports.export' }
};

const IAM_SLUGS = { ROLE: { SUBMIT: 'system.user_rights.roles.submit', APPROVE: 'system.user_rights.roles.approve', REJECT: 'system.user_rights.roles.reject' } };
const LEGACY_MAP = { 'tenants.create': SYSTEM_SLUGS.TENANTS.CREATE };

async function main() {
    console.log('🚀 Starting Permission Seed V6 (Full Setup)...');

    // 1. Wipe existing data (optional, but good for clean slate if needed, keeping users/roles for now unless specified)
    // await prisma.rolePermission.deleteMany({});
    // await prisma.permission.deleteMany({});

    console.log('📦 Upserting Roles...');

    // For Owner (System)
    let ownerRole = await prisma.role.findFirst({
        where: { name: 'Owner', tenantId: null }
    });
    if (!ownerRole) {
        ownerRole = await prisma.role.create({
            data: {
                name: 'Owner',
                description: 'System Owner with full access',
                scope: 'SYSTEM',
                isSystem: true,
                isLocked: true,
                status: 'ACTIVE'
            }
        });
    }

    let testRole = await prisma.role.findFirst({
        where: { name: 'Test', tenantId: null }
    });
    if (!testRole) {
        testRole = await prisma.role.create({
            data: {
                name: 'Test',
                description: 'Test Role with NO access',
                scope: 'SYSTEM',
                isSystem: false,
                isLocked: false,
                status: 'ACTIVE'
            }
        });
    }

    console.log('👤 Upserting Users...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    const ownerUser = await prisma.user.upsert({
        where: { email: 'owner@antigravity.com' },
        update: {
            password: hashedPassword
        },
        create: {
            email: 'owner@antigravity.com',
            password: hashedPassword,
            name: 'System Owner',
            // Assign role relation directly if possible, or use UserRole model
        }
    });

    // Assign Owner Role to Owner User
    // Model is UserRole: userId, roleId, tenantId
    // Use findFirst instead of upsert for UserRole due to potential null tenantId issue
    let ownerAssignment = await prisma.userRole.findFirst({
        where: { userId: ownerUser.id, roleId: ownerRole.id, tenantId: null }
    });
    if (!ownerAssignment) {
        await prisma.userRole.create({
            data: {
                userId: ownerUser.id,
                roleId: ownerRole.id,
                tenantId: null,
                assignedBy: 'system'
            }
        });
    }

    const testUser = await prisma.user.upsert({
        where: { email: 'test@antigravity.com' },
        update: {
            password: hashedPassword
        },
        create: {
            email: 'test@antigravity.com',
            password: hashedPassword,
            name: 'Test User',
        }
    });

    // Assign Test Role to Test User
    let testAssignment = await prisma.userRole.findFirst({
        where: { userId: testUser.id, roleId: testRole.id, tenantId: null }
    });
    if (!testAssignment) {
        await prisma.userRole.create({
            data: {
                userId: testUser.id,
                roleId: testRole.id,
                tenantId: null,
                assignedBy: 'system'
            }
        });
    }

    console.log('🛡️  Processing Permissions...');
    const flattenSlugs = (obj: any): { slug: string; scope: string, module: string }[] => {
        let results: { slug: string; scope: string, module: string }[] = [];
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                const slug = obj[key]; // e.g. 'system.tenants.read'
                const scope = slug.startsWith('tenant.') ? 'TENANT' : 'SYSTEM';
                const parts = slug.split('.');
                // module is usually the second part: system.[tenants].read
                const module = parts.length > 1 ? parts[1] : 'general';
                results.push({ slug, scope, module });
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                results = results.concat(flattenSlugs(obj[key]));
            }
        }
        return results;
    };

    const systemPerms = flattenSlugs(SYSTEM_SLUGS);
    const tenantPerms = flattenSlugs(TENANT_SLUGS);
    // const iamPerms = flattenSlugs(IAM_SLUGS); // merged into user_rights usually

    const allPermissions = [
        ...systemPerms, ...tenantPerms,
        ...Object.keys(LEGACY_MAP).map(k => ({ slug: k, scope: 'SYSTEM', module: 'legacy' }))
    ];

    // Deduplicate
    const uniqueMap = new Map();
    for (const p of allPermissions) {
        uniqueMap.set(p.slug, p);
    }
    const uniquePermissions = Array.from(uniqueMap.values());

    console.log(`📝 Upserting ${uniquePermissions.length} permissions...`);
    for (const p of uniquePermissions) {
        await prisma.permission.upsert({
            where: { slug: p.slug },
            update: { scope: p.scope, module: p.module },
            create: {
                slug: p.slug,
                description: `Auto: ${p.slug}`,
                scope: p.scope,
                module: p.module
            }
        });
    }

    console.log('🔍 Fetching all Permission IDs...');
    const dbPermissions = await prisma.permission.findMany();

    console.log('👑 Assigning ALL Permissions to Owner...');
    // We only assign permissions that match the Role's scope mostly, but Owner (System) gets everything usually or just System perms.
    // For safety, let's assign ALL System perms to System Owner.

    const ownerPermIds = dbPermissions.map(p => p.id); // Assigning ALL for now as requested "butun icazeleri ver"

    // Batch Insert RolePermissions for Owner
    const data = ownerPermIds.map(permId => ({
        roleId: ownerRole.id,
        permissionId: permId,
        // permissionSlug removed as it is not in the schema model
    }));

    // Use transaction or createMany. createMany skipDuplicates is handy.
    // However, schema might require 'permissionSlug' as well if it's in the model.
    // Checking previous schema: RolePermission has roleId, permissionId, permissionSlug.

    if (data.length > 0) {
        await prisma.rolePermission.createMany({
            data: data,
            skipDuplicates: true
        });
        console.log(`✅ Assigned ${data.length} permissions to Owner Role.`);
    }

    // [FIX] Explicitly Ensure ROLES Permissions are assigned to Owner
    console.log('🛡️ Verifying Owner ROLES & MATRIX Permissions...');
    const rolesPermissionsSlugs = [
        ...Object.values(SYSTEM_SLUGS.USER_RIGHTS.ROLES),
        ...Object.values(SYSTEM_SLUGS.USER_RIGHTS.MATRIX_VIEW),
        ...Object.values(SYSTEM_SLUGS.USER_RIGHTS.COMPLIANCE)
    ];
    const rolesPermissions = await prisma.permission.findMany({
        where: { slug: { in: rolesPermissionsSlugs } }
    });

    const rolesPermData = rolesPermissions.map(p => ({
        roleId: ownerRole.id,
        permissionId: p.id
    }));

    if (rolesPermData.length > 0) {
        await prisma.rolePermission.createMany({
            data: rolesPermData,
            skipDuplicates: true
        });
        console.log(`✅ FORCE-ASSIGNED ${rolesPermData.length} User Rights>Roles permissions to Owner.`);
    }

    console.log('🍔 Creating Menus & MenuItems...');
    // Create a default System Menu
    const sysMenu = await prisma.menu.upsert({
        where: { slug: 'system-main' },
        update: {},
        create: { name: 'System Main Menu', slug: 'system-main', isActive: true }
    });

    // Simple auto-generation of menu items from top-level keys of SYSTEM_SLUGS
    const keys = Object.keys(SYSTEM_SLUGS);
    let order = 10;
    for (const key of keys) {
        if (key === 'USER_RIGHTS') continue; // Skip complex nested for now or handle specifically

        await prisma.menuItem.create({
            data: {
                menuId: sysMenu.id,
                title: key.charAt(0) + key.slice(1).toLowerCase(), // e.g. DASHBOARD -> Dashboard
                path: `/admin/${key.toLowerCase()}`,
                order: order,
                // parentId: null
            }
        });
        order += 10;
    }

    console.log('✅ Seed Setup Completed Successfully!');
}

const fs = require('fs');

main()
    .catch((e) => {
        console.error(e);
        fs.writeFileSync('seed_error.log', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
        process.exit(1);
    })
    .finally(async () => { await prisma.$disconnect(); });
