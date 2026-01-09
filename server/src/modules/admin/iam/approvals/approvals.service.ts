/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHASE 14H: Approvals Service
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULE: This service performs DOMAIN OPERATIONS only.
 * 
 * Permission checks for "can user see this approval" are:
 * - 4-eyes principle (domain rule) ✅ ALLOWED
 * - Scope matching (domain rule) ✅ ALLOWED
 * 
 * VISIBILITY DECISIONS (which approvals to show in inbox) are delegated
 * to the caller (API layer) which uses pageState.actions.
 * 
 * The service receives pre-authorized permissions from the controller.
 * ═══════════════════════════════════════════════════════════════════════════
 */

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

/**
 * Approval eligibility check result
 */
export interface ApprovalEligibility {
    canApproveSystemRoles: boolean;
    canApproveTenantRoles: boolean;
}

@Injectable()
export class ApprovalsService {
    constructor(
        private readonly rolesService: RolesService
    ) { }



    /**
     * Aggregates pending approvals based on pre-computed eligibility.
     * 
     * PHASE 14H: Eligibility is computed by caller (controller)
     * using DecisionCenter/pageState if needed.
     * 
     * Domain rules applied here:
     * - 4-Eyes Principle (user cannot approve own submission)
     * - Scope matching (system vs tenant)
     */
    async getPendingApprovals(
        userId: string,
        eligibility: ApprovalEligibility
    ): Promise<ApprovalItem[]> {
        const items: ApprovalItem[] = [];

        // --- 1. ROLES APPROVALS ---
        if (eligibility.canApproveSystemRoles || eligibility.canApproveTenantRoles) {
            const result = await this.rolesService.findAll({
                filters: { status: RoleStatus.PENDING_APPROVAL },
                take: 100,
                skip: 0
            } as any);

            const roles = result.items;

            for (const role of roles) {
                // Domain Rule: 4-Eyes Principle
                if (role.submittedById === userId || role.createdById === userId) {
                    continue;
                }

                // Domain Rule: Scope matching
                if (role.scope === 'SYSTEM' && !eligibility.canApproveSystemRoles) continue;
                if (role.scope === 'TENANT' && !eligibility.canApproveTenantRoles) continue;

                items.push({
                    id: role.id,
                    type: 'ROLE',
                    title: `Role Approval: ${role.name}`,
                    description: role.description || `Scope: ${role.scope}`,
                    status: role.status,
                    createdAt: role.createdAt,
                    createdBy: {
                        id: role.createdById,
                        email: 'unknown',
                    },
                    metadata: {
                        scope: role.scope,
                        permissionsCount: role._count?.permissions
                    }
                });
            }
        }

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
