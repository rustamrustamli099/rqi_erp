
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { ADMIN_MENU_TREE } from './menu.definition';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantContextGuard } from '../tenant-context/tenant-context.guard';
import { PermissionCacheService } from '../auth/permission-cache.service';

@Controller('me/menu')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class MenuController {
    constructor(
        private readonly menuService: MenuService,
        private readonly permissionCache: PermissionCacheService
    ) { }

    @Get()
    async getMyMenu(@Request() req: any) {
        // req.tenantId comes from TenantContextGuard (or middleware)
        const tenantId = req.tenantId || req.user?.tenantId || 'system';
        const userId = req.user.id;

        let userPermissions: string[] = [];

        if (userId) {
            // Fetch effective permissions from Redis for this scope
            userPermissions = await this.permissionCache.getPermissions(userId, tenantId) || [];
        }

        // Filter the static tree based on these permissions
        return this.menuService.filterMenu(ADMIN_MENU_TREE, userPermissions);
    }
}
