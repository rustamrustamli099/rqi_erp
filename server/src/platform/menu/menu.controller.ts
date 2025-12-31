
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { ADMIN_MENU_TREE } from './menu.definition';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantContextGuard } from '../tenant-context/tenant-context.guard';
import { EffectivePermissionsService } from '../auth/effective-permissions.service';

@Controller('me/menu')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class MenuController {
    constructor(
        private readonly menuService: MenuService,
        private readonly effectivePermissionsService: EffectivePermissionsService
    ) { }

    @Get()
    async getMyMenu(@Request() req: any) {
        // [SAP-GRADE] Strict Session Context
        const { userId, scopeType, scopeId } = req.user;

        let userPermissions: string[] = [];

        if (userId) {
            // Fetch effective permissions strictly for this scope
            userPermissions = await this.effectivePermissionsService.computeEffectivePermissions({
                userId,
                scopeType: scopeType || 'SYSTEM',
                scopeId: scopeId || null
            });
        }

        // Filter the static tree based on these permissions
        return this.menuService.filterMenu(ADMIN_MENU_TREE, userPermissions);
    }
}
