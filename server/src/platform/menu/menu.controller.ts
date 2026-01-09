import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DecisionOrchestrator } from '../decision/decision.orchestrator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantContextGuard } from '../tenant-context/tenant-context.guard';

/**
 * PHASE 14H: Menu Controller
 * 
 * RULE: This endpoint is called frequently by frontend.
 * Rate limiting is SKIPPED because DecisionOrchestrator has its own caching.
 */
@Controller('me/menu')
@UseGuards(JwtAuthGuard, TenantContextGuard)
@SkipThrottle() // Menu is cached by DecisionOrchestrator, no rate limit needed
export class MenuController {
    constructor(
        private readonly decisionOrchestrator: DecisionOrchestrator
    ) { }

    @Get()
    async getMyMenu(@Request() req: any) {
        // [SAP-GRADE] Orchestration handles extraction, permissions, and tree resolution
        // DecisionOrchestrator has built-in caching (5 min TTL)
        const decision = await this.decisionOrchestrator.getNavigationForUser(req.user);

        // Return wrapped response to match frontend useMenu.ts expectation
        return {
            menu: decision.navigation,
            defaultRoute: decision.canonicalPath,
            actions: decision.actions
        };
    }
}
