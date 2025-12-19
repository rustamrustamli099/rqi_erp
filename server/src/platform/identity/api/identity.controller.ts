
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { IdentityUseCase } from '../application/identity.usecase';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';

@Controller('identity')
export class IdentityController {
    constructor(private readonly identityUseCase: IdentityUseCase) { }

    @Get('users/:email')
    @UseGuards(JwtAuthGuard)
    async getUserByEmail(@Param('email') email: string) {
        return this.identityUseCase.findUserByEmail(email);
    }
}
