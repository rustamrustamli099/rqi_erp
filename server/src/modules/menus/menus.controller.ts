import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MenusService } from './menus.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('menus')
@UseGuards(JwtAuthGuard)
export class MenusController {
    constructor(private menusService: MenusService) { }

    @Get('sidebar')
    async getSidebar(@Request() req) {
        // req.user.role is populated by JwtStrategy (single role string)
        const role = req.user?.role;
        const roles = role ? [role] : [];
        return this.menusService.getSidebar(roles);
    }
}
