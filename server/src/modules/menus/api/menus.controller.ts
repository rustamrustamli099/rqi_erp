import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MenusUseCase } from '../application/menus.usecase';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';

@Controller('menus')
@UseGuards(JwtAuthGuard)
export class MenusController {
    constructor(private menusUseCase: MenusUseCase) { }

    @Get('sidebar')
    async getSidebar(@Request() req) {
        // req.user.role is populated by JwtStrategy (single role string)
        const role = req.user?.role;
        const roles = role ? [role] : [];
        return this.menusUseCase.getSidebar(roles);
    }
}
