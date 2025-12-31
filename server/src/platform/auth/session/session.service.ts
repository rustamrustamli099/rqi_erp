import { Injectable, UnauthorizedException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { AuthService } from '../auth.service';
import { ScopeType, SwitchContextDto } from './dto/switch-context.dto';

@Injectable()
export class SessionService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService
    ) { }

    /**
     * Returns all valid scopes for a user based on their Role Assignments.
     */
    async getAvailableScopes(userId: string) {
        // SAP-GRADE: Explicit assignments only. Global/System roles might have null scopeId.
        const assignments = await (this.prisma as any).userRoleAssignment.findMany({
            where: { userId },
            select: {
                scopeType: true,
                scopeId: true
            },
            distinct: ['scopeType', 'scopeId']
        });

        // Enrich with Tenant Names if possible (simple optimization)
        // For now, returning raw scopes.
        return assignments.map((a: any) => ({
            scopeType: a.scopeType,
            scopeId: a.scopeId,
            label: a.scopeId ? `Tenant ${a.scopeId}` : 'System' // TO-DO: Fetch real names
        }));
    }

    /**
     * Context Switching Logic (The "Login" to a specific context)
     */
    async switchContext(userId: string, target: SwitchContextDto) {
        // [VALIDATION] SAP-Grade Scope Rules
        if (target.scopeType === 'SYSTEM' && target.scopeId) {
            throw new ForbiddenException('SYSTEM scope cannot have a scopeId');
        }
        if (target.scopeType === 'TENANT' && !target.scopeId) {
            throw new ForbiddenException('TENANT scope requires a scopeId');
        }

        // 1. Validate Assignment (Security Core)
        // User MUST have at least one role in the target scope.
        // For SYSTEM scope, scopeId is null.
        const hasAssignment = await (this.prisma as any).userRoleAssignment.findFirst({
            where: {
                userId: userId,
                scopeType: target.scopeType,
                scopeId: target.scopeId || null
            }
        });

        if (!hasAssignment) {
            throw new ForbiddenException({
                message: 'Access Denied: You do not have roles in the requested scope.',
                code: 'SCOPE_NOT_ASSIGNED'
            });
        }

        // 2. Fetch User for Token Generation
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException();

        // 3. Issue New Token
        return this.authService.issueTokenForScope(user, target.scopeType, target.scopeId || null);
    }
}
