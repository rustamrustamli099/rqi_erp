import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MenusUseCase } from '../application/menus.usecase';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MenusController {
    constructor(private menusUseCase: MenusUseCase) { }

    @Get('menu')
    async getSidebar(@Request() req) {
        // Pass full user object for isOwner check
        return this.menusUseCase.getSidebar(req.user);
    }
}
