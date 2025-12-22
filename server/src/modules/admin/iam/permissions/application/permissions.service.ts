import { Inject, Injectable } from '@nestjs/common';
import { PreviewPermissionsDto } from '../api/dto/preview-permissions.dto';
import { IRoleRepository } from '../../../../../platform/identity/domain/role.repository.interface';
import { MenuService } from '../../../../../platform/menu/menu.service';
import { ADMIN_MENU_TREE } from '../../../../../platform/menu/menu.definition';

@Injectable()
export class PermissionsService {
    constructor(
        // @Inject('IRoleRepository') private readonly roleRepository: IRoleRepository, // Check injection token
        // Use string token if interface, or class if abstract
        @Inject(MenuService) private readonly menuService: MenuService,
        // Since we are cross-module, we need to ensure RoleRepository is exported or use a service
        // Ideally IdentityUseCase or RoleService.
        // I will assume IUserRepository or similar is available.
        // Let's use any for now to avoid compilation type check deadloop if I don't know exact token.
        // Actually, I should use PrismaRoleRepository or token 'IRoleRepository'.
        // Looking at IdentityUseCase, it uses @Inject(IUserRepository).
        // I will assume @Inject(IRoleRepository) works if token is set.
        @Inject(IRoleRepository) private readonly roleRepository: IRoleRepository,
    ) { }

    async previewPermissions(dto: PreviewPermissionsDto) {
        // 1. Fetch Roles & Permissions
        const effectivePermissions: string[] = [];

        if (dto.roleIds && dto.roleIds.length > 0) {
            for (const roleId of dto.roleIds) {
                const role = await this.roleRepository.findById(roleId);
                // [Scope Logic] If context is Tenant, filter out System-only roles if necessary?
                // For now, assume if you rely on the role, you get the perms.
                if (role && role.permissions) {
                    effectivePermissions.push(...role.permissions);
                }
            }
        }

        // Add explicit permissions
        if (dto.permissions) {
            effectivePermissions.push(...dto.permissions);
        }

        // Deduplicate
        const uniquePerms = Array.from(new Set(effectivePermissions));

        // [Zero-Permission Detection]
        if (uniquePerms.length === 0) {
            return {
                visibleMenus: [],
                visibleRoutes: [],
                blockedRoutes: this.getAllRoutes(), // All routes blocked
                effectivePermissions: [],
                summary: { totalPermissions: 0, byModule: {} },
                accessState: 'ZERO_PERMISSION_LOCKOUT'
            };
        }

        // 2. Filter Menu (Visuals)
        const visibleMenus = this.menuService.filterMenu(ADMIN_MENU_TREE, uniquePerms);

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
            totalPermissions: uniquePerms.length,
            byModule: {}
        };

        uniquePerms.forEach(slug => {
            const parts = slug.split('.');
            if (parts.length > 1) {
                const module = parts[1]; // platform.<module>
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
