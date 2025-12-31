
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { IdentityUseCase } from '../application/identity.usecase';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly identityUseCase: IdentityUseCase) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUsers(@Request() req: any) {
        // Only return users for the current tenant
        // req.user is populated by JwtStrategy
        return this.identityUseCase.findAllUsers(req.user.tenantId);
    }
}
