import { Injectable, ForbiddenException } from '@nestjs/common';
import { RolesService } from '../roles/application/roles.service';
import { RoleStatus } from '@prisma/client';

export interface ApprovalItem {
    id: string;
    type: 'ROLE' | 'BILLING' | 'CONTRACT';
    title: string;
    description?: string;
    status: string;
    createdAt: Date;
    createdBy: {
        id: string;
        email: string;
        fullName?: string;
    };
    metadata?: any;
}

@Injectable()
export class ApprovalsService {
    constructor(
        private readonly rolesService: RolesService
    ) { }

    /**
     * Aggregates all pending approvals from various domains.
     * Enforces Strict Eligibility:
     * 1. Status is PENDING.
     * 2. User has explicit permission (e.g. system.roles.approve).
     * 3. User is NOT the creator (4-Eyes Principle).
     */
    async getPendingApprovals(userId: string, permissions: string[]): Promise<ApprovalItem[]> {
        const items: ApprovalItem[] = [];

        // --- 1. ROLES APPROVALS ---
        // Check if user has ANY role approval permission before querying DB
        // Optimization: Don't query if they can't approve anyway.
        const canApproveSystemRoles = permissions.includes('system.roles.approve');
        const canApproveTenantRoles = permissions.includes('tenant.roles.approve') || permissions.includes('system.tenants.roles.approve');

        if (canApproveSystemRoles || canApproveTenantRoles) {
            // Fetch PENDING roles
            // We fetch ALL pending roles first, then filter in memory for strict checks 
            // (or we could push checks to DB, but 4-eyes "not creator" is easier in code if DB structure varies)
            const result = await this.rolesService.findAll({
                filters: { status: RoleStatus.PENDING_APPROVAL },
                take: 100, // Reasonable limit for inbox
                skip: 0
            } as any);

            const roles = result.items;

            for (const role of roles) {
                // Check 1: 4-Eyes Principle
                if (role.submittedById === userId || role.createdById === userId) {
                    continue;
                }

                // Check 2: Scope Permission
                if (role.scope === 'SYSTEM' && !canApproveSystemRoles) continue;
                if (role.scope === 'TENANT' && !canApproveTenantRoles) continue;

                // Add to Inbox
                items.push({
                    id: role.id,
                    type: 'ROLE',
                    title: `Role Approval: ${role.name}`,
                    description: role.description || `Scope: ${role.scope}`,
                    status: role.status,
                    createdAt: role.createdAt,
                    createdBy: {
                        id: role.createdById, // We assume findAll returns this or we need to fetch user details. 
                        // RolesService.findAll includes creator? No, let's verify. 
                        // For now, minimal data.
                        email: 'unknown', // Todo: Expand RolesService to include creator details
                    },
                    metadata: {
                        scope: role.scope,
                        permissionsCount: role._count?.permissions
                    }
                });
            }
        }

        // --- 2. FUTURE DOMAINS (Billing, etc.) ---
        // if (permissions.includes('system.billing.approve')) { ... }

        return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async approve(id: string, type: 'ROLE', approverId: string, context: { scopeType: string, scopeId: string | null }) {
        if (type === 'ROLE') {
            return this.rolesService.approve(id, approverId, context);
        }
        throw new ForbiddenException('Unknown approval type');
    }

    async reject(id: string, type: 'ROLE', reason: string, userId: string, context: { scopeType: string, scopeId: string | null }) {
        if (type === 'ROLE') {
            return this.rolesService.reject(id, reason, userId, context);
        }
        throw new ForbiddenException('Unknown approval type');
    }
}
