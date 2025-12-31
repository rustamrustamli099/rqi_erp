import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SessionService } from './session.service';
import { SwitchContextDto } from './dto/switch-context.dto';
import { JwtAuthGuard } from '../jwt-auth.guard'; // Use existing guard

@Controller('session')
@UseGuards(JwtAuthGuard)
export class SessionController {
    constructor(private readonly sessionService: SessionService) { }

    @Get('scopes')
    async getScopes(@Request() req: any) {
        return this.sessionService.getAvailableScopes(req.user.userId);
    }

    @Get('context')
    async getContext(@Request() req: any) {
        return {
            userId: req.user.userId,
            scopeType: req.user.scopeType || 'UNKNOWN', // Claims from token
            scopeId: req.user.tenantId || null
        };
    }

    @Post('context')
    async switchContext(@Request() req: any, @Body() dto: SwitchContextDto) {
        return this.sessionService.switchContext(req.user.userId, dto);
    }
}
