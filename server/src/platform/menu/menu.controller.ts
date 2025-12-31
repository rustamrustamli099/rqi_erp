import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DecisionOrchestrator } from '../decision/decision.orchestrator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantContextGuard } from '../tenant-context/tenant-context.guard';

@Controller('me/menu')
@UseGuards(JwtAuthGuard, TenantContextGuard)
export class MenuController {
    constructor(
        private readonly decisionOrchestrator: DecisionOrchestrator
    ) { }

    @Get()
    async getMyMenu(@Request() req: any) {
        // [SAP-GRADE] Orchestration handles extraction, permissions, and tree resolution
        return this.decisionOrchestrator.getNavigationForUser(req.user);
    }
}
