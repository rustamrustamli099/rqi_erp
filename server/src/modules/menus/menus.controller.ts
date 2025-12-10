import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MenusService } from './menus.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('menus')
@UseGuards(JwtAuthGuard)
export class MenusController {
    constructor(private menusService: MenusService) { }

    @Get('sidebar')
    async getSidebar(@Request() req) {
        // req.user.roles is populated by JwtStrategy
        return this.menusService.getSidebar(req.user?.roles || []);
    }
}
