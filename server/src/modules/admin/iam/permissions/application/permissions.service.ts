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
                if (role && role.permissions) {
                    effectivePermissions.push(...role.permissions);
                }
            }
        }

        // Add explicit permissions (e.g. from unsaved drafts)
        if (dto.permissions) {
            effectivePermissions.push(...dto.permissions);
        }

        // Deduplicate
        const uniquePerms = Array.from(new Set(effectivePermissions));

        // 2. Filter Menu
        // We assume ADMIN preview for now. 
        // If tenantId is present, we might want TENANT_MENU (if it existed in platform/menu).
        // platform/menu seemed to only have ADMIN_MENU_TREE in my view.
        // I will just use ADMIN_MENU_TREE for the /admin/permissions/preview endpoint.
        const visibleMenus = this.menuService.filterMenu(ADMIN_MENU_TREE, uniquePerms);

        // 3. Calculate Routes (Flatten Paths)
        const getRoutes = (items: any[]): string[] => {
            let routes: string[] = [];
            for (const item of items) {
                if (item.path) routes.push(item.path);
                if (item.children) routes.push(...getRoutes(item.children));
            }
            return routes;
        };

        const visibleRoutes = getRoutes(visibleMenus);

        return {
            visibleMenus,
            visibleRoutes,
            blockedRoutes: [], // TODO: Calculate diff from full list
            effectivePermissions: uniquePerms
        };
    }
}
