import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PermissionRegistry } from './permissions';
import { MenuService } from '../menu/menu.service';
import { ADMIN_MENU_TREE } from '../menu/menu.definition';
import { IRoleRepository } from '../identity/domain/role.repository.interface';
import { PreviewPermissionsDto } from '../../modules/admin/iam/permissions/api/dto/preview-permissions.dto';

// =================================================================================================
// PERMISSION DEFINITIONS (Source of Truth)
// =================================================================================================
export const admin_panel_permissions = {
    dashboard: {
        perms: ['read']
    },
    tenants: {
        perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'tenant_users', 'reset_password', '2fa_app_cancel', '2fa_app_enable', '2fa_app_generate', 'impersonate', 'modules', 'storage_limit', 'billing_history', 'limitations', 'sign_contract', 'terminate_contract', 'suspend']
    },
    branches: { perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'read_details', "change_status"] },
    users: {
        users: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', "change_status", 'connect_to_employee', 'invite']
        },
        curators: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', "change_status", 'copy_id']
        },
    },
    billing: {
        market_place: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
        },
        compact_packages: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
        },
        plans: {
            perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
        },
        invoices: {
            perms: ['read', 'download_pdf', "send_email", 'approve']
        },
        licenses: {
            perms: ['read', 'audit_logs', 'change_plan']
        },
    },
    approvals: {
        perms: ['read', 'forward', 'approve', 'reject', 'export_to_excel']
    },
    file_manager: {
        perms: ['read', 'create_folder', 'upload', 'delete_file', 'rename_folder', 'move_folder', 'share_folder', 'permissions_configuration', 'delete_folder', 'rename_file', 'move_file', 'copy_file', 'share_file', 'version']
    },
    system_guide: {
        perms: ['read', 'create', 'update', 'delete', 'share', 'edit', 'publish']
    },
    settings: {
        general: {
            company_profile: {
                perms: ['read', 'create', 'update']
            },
            notification_engine: {
                perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status', 'copy_json']
            },
        },
        communication: {
            smtp_email: {
                perms: ['read', 'create', 'update', 'delete', 'test_connection']
            },
            smtp_sms: {
                perms: ['read', 'create', 'update', 'delete', 'test_connection', 'change_status']
            },
        },
        security: {
            security_policy: {
                password_policy: {
                    perms: ['read', 'create', 'update']
                },
                access_policy: {
                    perms: ['read', 'create', 'update']
                },
                session_policy: {
                    perms: ['read', 'create', 'update']
                },
                global_policy: {
                    perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'change_status']
                },
            },
            sso_OAuth: {
                perms: ['read', 'create', 'update', 'delete', 'change_status']
            },
            user_rights: {
                roles: {
                    perms: ['read', 'create', 'update', 'delete', 'export_to_excel', 'select_permissions', 'submit', 'approve', 'reject']
                },
                permission: {
                    perms: ['read', 'create', 'update']
                },
                permission_matrix: {
                    perms: ['read']
                },
                compliance: {
                    perms: ['read', 'download_report', 'generate_evidence', 'download_json_soc2', 'download_json_iso']
                }
            },
        },
        system_configurations: {
            // SAP-GRADE: Keys aligned with frontend registry (tabSubTab.registry.ts)
            billing_configurations: {
                pricing: {
                    perms: ['read', 'create', 'update']
                },
                limits: {
                    perms: ['read', 'create', 'update']
                },
                overuse: {
                    perms: ['read', 'create', 'update']
                },
                grace: {
                    perms: ['read', 'create', 'update']
                },
                currency_tax: {
                    perms: ['read', 'create', 'update']
                },
                invoice: {
                    perms: ['read', 'create', 'update']
                },
                events: {
                    perms: ['read', 'create', 'update']
                },
                security: {
                    perms: ['read', 'create', 'update']
                },
            },
            dictionary: {
                sectors: {
                    perms: ['read', 'create', 'update', 'delete']
                },
                units: {
                    perms: ['read', 'create', 'update', 'delete']
                },
                currencies: {
                    perms: ['read', 'create', 'update', 'delete']
                },
                addresses: {
                    perms: ['read_country', "create_country", "update_country", "delete_country", "read_city", "create_city", "update_city", "delete_city", "read_district", "create_district", "update_district", "delete_district"],
                },
                time_zones: { perms: ['read', 'create', 'update', 'delete', 'set_default'] },
            },
            document_templates: {
                perms: ['read', 'configurate', 'update', 'set_default', 'download', 'delete', 'export_to_excel', 'create']
            },
            workflow: {
                configuration: {
                    perms: ['read', 'create', 'update']
                },
                control: {
                    perms: ['read', 'refresh', 'read_details', 'logs', 'approve', 'reject', 'delegate', 'escalate', 'cancel_process']
                },
            },
        },
    },
    system_console: {
        dashboard: {
            perms: ['read', 'change_technical_inspection_mode', 'end_all_sessions', 'clear_cache']
        },
        monitoring: {
            dashboard: {
                perms: ['read']
            },
            alert_rules: {
                perms: ['read', 'create', 'update', 'delete']
            },
            anomaly_detection: {
                perms: ['read', 'configure']
            },
            system_logs: {
                perms: ['read', 'clear', 'export_to_excel']
            },
        },
        audit_compliance: { perms: ['read', 'export_to_excel', 'read_details'] },
        job_scheduler: {
            perms: ['read', 'execute_now', 'details', 'logs', 'execute']
        },
        data_retention: {
            perms: ['read', 'create', 'simulate', 'delete', 'update', 'manage']
        },
        feature_flags: {
            perms: ['read', 'create', 'update', 'delete', 'change_status', 'manage', 'toggle']
        },
        policy_security: {
            perms: ['read', 'create', 'update', 'delete', 'change_status', 'simulate', 'manage']
        },
        feedback: {
            perms: ['read', 'read_details', 'is_done', 'cancel']
        },
        tools: {
            perms: ['read', 'clear_cache', 'change_maintenance_mode', 'execute']
        },
    },
    developer_hub: {
        api_reference: {
            perms: ['read', 'open_rest_api_docs', 'open_graphQL_api_docs']
        },
        sdk: {
            perms: ['read', 'download']
        },
        webhooks: {
            perms: ['read', 'send_test_payload']
        },
        permission_map: {
            perms: ['read']
        },
    },
};

@Injectable()
export class PermissionsService implements OnModuleInit {
    constructor(
        @Inject(MenuService) private readonly menuService: MenuService,
        @Inject(IRoleRepository) private readonly roleRepository: IRoleRepository,
    ) { }

    /**
     * Non-read actions that imply read access (SAP-Grade)
     */
    private static readonly NON_READ_ACTIONS = [
        'create', 'update', 'delete', 'manage', 'approve', 'reject',
        'export', 'export_to_excel', 'download', 'upload', 'execute',
        'configure', 'submit', 'forward', 'impersonate', 'invite',
        'change_status', 'toggle', 'simulate', 'test_connection'
    ];

    onModuleInit() {
        console.log('Permissions Service Initialized with SAP-Grade Normalization');
    }

    /**
     * SAP-Grade Permission Normalization (PHASE 14H.4)
     * 
     * RULE: EXACT MATCH ONLY
     * - NO inference
     * - NO derived permissions
     * - NO auto-add .read/.access
     * 
     * Returns permissions exactly as stored in DB.
     */
    private normalizePermissions(rawPermissions: string[]): string[] {
        // PHASE 14H.4: NO INFERENCE - deduplicate and sort only
        const normalized = new Set<string>();

        rawPermissions.forEach(perm => {
            if (!perm || typeof perm !== 'string') return;
            normalized.add(perm); // Add original only - NO inference
        });

        return Array.from(normalized).sort();
    }

    /**
     * Returns all available system permissions as flat list.
     * Used by Permission Editor UI.
     */
    async findAll(): Promise<any[]> {
        const systemSlugs = this.flattenPermissionsMap(admin_panel_permissions, 'system');
        // TODO: Merge with Tenant Slugs if needed
        return systemSlugs.map(slug => ({
            id: slug,
            slug: slug,
            description: slug // TODO: Add human readable descriptions map
        }));
    }

    async previewPermissions(dto: PreviewPermissionsDto) {
        // 1. Fetch Roles & Permissions
        const effectivePermissions: string[] = [];

        if (dto.roleIds && dto.roleIds.length > 0) {
            for (const roleId of dto.roleIds) {
                const role = await this.roleRepository.findById(roleId);
                if (role && role.permissions) {
                    effectivePermissions.push(...role.permissions);
                }
            }
        }

        // Add explicit permissions
        if (dto.permissions) {
            effectivePermissions.push(...dto.permissions);
        }

        // SAP-Grade: Normalize permissions
        const normalizedPerms = this.normalizePermissions(effectivePermissions);

        // [Zero-Permission Detection]
        if (normalizedPerms.length === 0) {
            return {
                visibleMenus: [],
                visibleRoutes: [],
                blockedRoutes: this.getAllRoutes(),
                effectivePermissions: [],
                normalizedPermissions: [],
                summary: { totalPermissions: 0, byModule: {} },
                accessState: 'ZERO_PERMISSION_LOCKOUT'
            };
        }

        // 2. Filter Menu with NORMALIZED permissions
        const visibleMenus = this.menuService.filterMenu(ADMIN_MENU_TREE, normalizedPerms);

        // 3. Calculate Routes
        const getRoutes = (items: any[]): string[] => {
            let routes: string[] = [];
            for (const item of items) {
                if (item.path) routes.push(item.path);
                if (item.children) routes.push(...getRoutes(item.children));
            }
            return routes;
        };

        const visibleRoutes = getRoutes(visibleMenus);
        const allRoutes = this.getAllRoutes();
        const blockedRoutes = allRoutes.filter(r => !visibleRoutes.includes(r));

        // 4. Grant Capabilities Summary (by module)
        const summary = {
            totalPermissions: normalizedPerms.length,
            byModule: {} as any
        };

        normalizedPerms.forEach(slug => {
            const parts = slug.split('.');
            if (parts.length > 1) {
                const module = parts[1];
                summary.byModule[module] = (summary.byModule[module] || 0) + 1;
            }
        });

        return {
            visibleMenus,
            visibleRoutes,
            blockedRoutes,
            effectivePermissions: effectivePermissions, // Original
            normalizedPermissions: normalizedPerms, // After normalization
            summary,
            accessState: 'GRANTED'
        };
    }

    private flattenPermissionsMap(obj: any, prefix: string): string[] {
        let permissions: string[] = [];

        for (const key in obj) {
            if (key === 'perms' && Array.isArray(obj[key])) {
                obj[key].forEach((action: string) => {
                    permissions.push(`${prefix}.${action}`);
                });
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                const nextPrefix = prefix ? `${prefix}.${key}` : key;
                permissions.push(...this.flattenPermissionsMap(obj[key], nextPrefix));
            }
        }

        return permissions;
    }

    private getAllRoutes(): string[] {
        const getRoutes = (items: any[]): string[] => {
            let routes: string[] = [];
            for (const item of items) {
                if (item.path) routes.push(item.path);
                if (item.children) routes.push(...getRoutes(item.children));
            }
            return routes;
        };
        return getRoutes(ADMIN_MENU_TREE);
    }
}

