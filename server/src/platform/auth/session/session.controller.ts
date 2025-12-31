import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SessionService } from './session.service';
import { SwitchContextDto } from './dto/switch-context.dto';
import { JwtAuthGuard } from '../jwt-auth.guard'; // Use existing guard
import { DecisionOrchestrator } from '../../decision/decision.orchestrator';

@Controller('session')
@UseGuards(JwtAuthGuard)
export class SessionController {
    constructor(
        private readonly sessionService: SessionService,
        private readonly decisionOrchestrator: DecisionOrchestrator
    ) { }

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

    @Get('bootstrap')
    async getBootstrap(@Request() req: any) {
        // [SAP-GRADE] Full UI Bootstrap
        return this.decisionOrchestrator.getSessionState(req.user);
    }

    @Post('context')
    async switchContext(@Request() req: any, @Body() dto: SwitchContextDto) {
        return this.sessionService.switchContext(req.user.userId, dto);
    }
}
