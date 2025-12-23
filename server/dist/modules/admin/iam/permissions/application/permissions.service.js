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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const role_repository_interface_1 = require("../../../../../platform/identity/domain/role.repository.interface");
const menu_service_1 = require("../../../../../platform/menu/menu.service");
const menu_definition_1 = require("../../../../../platform/menu/menu.definition");
let PermissionsService = class PermissionsService {
    menuService;
    roleRepository;
    constructor(menuService, roleRepository) {
        this.menuService = menuService;
        this.roleRepository = roleRepository;
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
        const uniquePerms = Array.from(new Set(effectivePermissions));
        if (uniquePerms.length === 0) {
            return {
                visibleMenus: [],
                visibleRoutes: [],
                blockedRoutes: this.getAllRoutes(),
                effectivePermissions: [],
                summary: { totalPermissions: 0, byModule: {} },
                accessState: 'ZERO_PERMISSION_LOCKOUT'
            };
        }
        const visibleMenus = this.menuService.filterMenu(menu_definition_1.ADMIN_MENU_TREE, uniquePerms);
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
            totalPermissions: uniquePerms.length,
            byModule: {}
        };
        uniquePerms.forEach(slug => {
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
            effectivePermissions: uniquePerms,
            summary,
            accessState: 'GRANTED'
        };
    }
    async findAll() {
        const { admin_panel_permissions } = require('../../../../../common/constants/perms');
        const systemSlugs = this.flattenPermissionsMap(admin_panel_permissions, 'system');
        return systemSlugs.map(slug => ({
            id: slug,
            slug: slug,
            description: slug
        }));
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
        if (obj.perms && Array.isArray(obj.perms)) {
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
//# sourceMappingURL=permissions.service.js.map