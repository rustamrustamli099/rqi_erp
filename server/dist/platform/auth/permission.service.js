"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = exports.admin_panel_permissions = void 0;
const common_1 = require("@nestjs/common");
const menu_service_1 = require("../menu/menu.service");
const menu_definition_1 = require("../menu/menu.definition");
const role_repository_interface_1 = require("../identity/domain/role.repository.interface");
exports.admin_panel_permissions = {
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
                role: {
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
let PermissionsService = class PermissionsService {
    menuService;
    roleRepository;
    constructor(menuService, roleRepository) {
        this.menuService = menuService;
        this.roleRepository = roleRepository;
    }
    static NON_READ_ACTIONS = [
        'create', 'update', 'delete', 'manage', 'approve', 'reject',
        'export', 'export_to_excel', 'download', 'upload', 'execute',
        'configure', 'submit', 'forward', 'impersonate', 'invite',
        'change_status', 'toggle', 'simulate', 'test_connection'
    ];
    onModuleInit() {
        console.log('Permissions Service Initialized with SAP-Grade Normalization');
    }
    normalizePermissions(rawPermissions) {
        const normalized = new Set();
        rawPermissions.forEach(perm => {
            if (!perm || typeof perm !== 'string')
                return;
            normalized.add(perm);
        });
        return Array.from(normalized).sort();
    }
    async findAll() {
        const systemSlugs = this.flattenPermissionsMap(exports.admin_panel_permissions, 'system');
        return systemSlugs.map(slug => ({
            id: slug,
            slug: slug,
            description: slug
        }));
    }
    async previewPermissions(dto) {
        const effectivePermissions = [];
        if (dto.roleIds && dto.roleIds.length > 0) {
            for (const roleId of dto.roleIds) {
                const role = await this.roleRepository.findById(roleId);
                if (role && role.permissions) {
                    effectivePermissions.push(...role.permissions);
                }
            }
        }
        if (dto.permissions) {
            effectivePermissions.push(...dto.permissions);
        }
        const normalizedPerms = this.normalizePermissions(effectivePermissions);
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
        const visibleMenus = this.menuService.filterMenu(menu_definition_1.ADMIN_MENU_TREE, normalizedPerms);
        const getRoutes = (items) => {
            let routes = [];
            for (const item of items) {
                if (item.path)
                    routes.push(item.path);
                if (item.children)
                    routes.push(...getRoutes(item.children));
            }
            return routes;
        };
        const visibleRoutes = getRoutes(visibleMenus);
        const allRoutes = this.getAllRoutes();
        const blockedRoutes = allRoutes.filter(r => !visibleRoutes.includes(r));
        const summary = {
            totalPermissions: normalizedPerms.length,
            byModule: {}
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
            effectivePermissions: effectivePermissions,
            normalizedPermissions: normalizedPerms,
            summary,
            accessState: 'GRANTED'
        };
    }
    flattenPermissionsMap(obj, prefix) {
        let permissions = [];
        for (const key in obj) {
            if (key === 'perms' && Array.isArray(obj[key])) {
                obj[key].forEach((action) => {
                    permissions.push(`${prefix}.${action}`);
                });
            }
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                const nextPrefix = prefix ? `${prefix}.${key}` : key;
                permissions.push(...this.flattenPermissionsMap(obj[key], nextPrefix));
            }
        }
        return permissions;
    }
    getAllRoutes() {
        const getRoutes = (items) => {
            let routes = [];
            for (const item of items) {
                if (item.path)
                    routes.push(item.path);
                if (item.children)
                    routes.push(...getRoutes(item.children));
            }
            return routes;
        };
        return getRoutes(menu_definition_1.ADMIN_MENU_TREE);
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(menu_service_1.MenuService)),
    __param(1, (0, common_1.Inject)(role_repository_interface_1.IRoleRepository)),
    __metadata("design:paramtypes", [menu_service_1.MenuService, Object])
], PermissionsService);
//# sourceMappingURL=permission.service.js.map