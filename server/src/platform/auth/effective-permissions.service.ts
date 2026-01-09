import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

/**
 * SAP-GRADE EFFECTIVE PERMISSION ENGINE
 * 
 * This service is the SINGLE source of truth for "What can User U do in Scope S?".
 * It enforces the GEMINI Constitution:
 * 1. Users have NO permissions directly.
 * 2. Permissions come ONLY from Roles.
 * 3. Assignments MUST be scoped.
 */

export interface PermissionComputationRequest {
    userId: string;
    scopeType: 'SYSTEM' | 'TENANT' | 'UNIT'; // Expandable
    scopeId: string | null; // NULL only allowed for SYSTEM scope if strictly defined, otherwise explicit ID.
}

@Injectable()
export class EffectivePermissionsService {
    private readonly logger = new Logger(EffectivePermissionsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Computes the flat list of permission slugs for a given user in a specific scope.
     * This is an expensive operation and SHOULD be cached by the caller (PermissionCacheService).
     */
    async computeEffectivePermissions(params: PermissionComputationRequest): Promise<string[]> {
        const { userId, scopeType, scopeId } = params;

        this.logger.debug(`Computing permissions for User: ${userId}, Scope: ${scopeType}:${scopeId}`);

        // ---------------------------------------------------------
        // SAP-GRADE: NO OWNER BYPASS
        // ---------------------------------------------------------
        // ALL users (including owners) must have explicit role-based permissions.
        // There is NO "superuser bypass" - this is a security requirement.
        // If an owner needs full access, assign them the "Owner" role with all permissions.

        // ---------------------------------------------------------
        // 1. LOAD ASSIGNMENTS (The ONLY Entry Point)
        // ---------------------------------------------------------
        // We query the "UserRoleAssignment" table. 
        // We do NOT support "Global Fallback" (e.g. if no tenant role, check system). 
        // Use separate calls if you need multi-scope aggregation.

        // Note: Using 'any' for Prisma model access as the schema definition 
        // might not be fully generated invocation-side in this environment.
        const assignments = await (this.prisma as any).userRole.findMany({
            where: {
                userId: userId,
                // scopeType: scopeType, // UserRole implies specific tenant (scopeId) OR system (null)
                // We need to map scopeType/ScopeId to tenantId logic
                // If ScopeType is SYSTEM, tenantId must be null. 
                // If ScopeType is TENANT, tenantId must be scopeId.
                tenantId: scopeType === 'SYSTEM' ? null : scopeId
            },
            select: {
                roleId: true
            }
        });

        if (!assignments || assignments.length === 0) {
            return [];
        }

        const assignedRoleIds = assignments.map((a: any) => a.roleId);

        // ---------------------------------------------------------
        // 2. RESOLVE ROLES (Graph Traversal for Composite Roles)
        // ---------------------------------------------------------
        // A role can be a "Single Role" or a "Composite Role".
        // If Composite, it implies all permissions of its children.
        // We must traverse the graph to find ALL leaf roles.

        const effectiveRoleIds = await this.resolveRoleHierarchy(assignedRoleIds);

        // ---------------------------------------------------------
        // 3. COLLECT PERMISSIONS
        // ---------------------------------------------------------
        // Load permissions for all resolved roles.

        const rolePermissions = await (this.prisma as any).rolePermission.findMany({
            where: {
                roleId: { in: Array.from(effectiveRoleIds) }
            },
            select: {
                permission: {
                    select: {
                        slug: true
                    }
                }
            }
        });

        // ---------------------------------------------------------
        // 4. DEDUPLICATE & RETURN
        // ---------------------------------------------------------
        const uniqueSlugs = new Set<string>();
        rolePermissions.forEach((rp: any) => {
            if (rp.permission?.slug) {
                uniqueSlugs.add(rp.permission.slug);
            }
        });

        const result = Array.from(uniqueSlugs).sort();

        this.logger.debug(`Computed ${result.length} unique permissions for User ${userId}`);

        return result;
    }

    /**
     * cycle-safe graph traversal involves recursive fetching of child roles.
     * In SAP PFCG, Composite Roles -> Single Roles.
     * We support Multi-Level Composites (Composite -> Composite -> Single).
     */
    private async resolveRoleHierarchy(initialRoleIds: string[]): Promise<Set<string>> {
        const visited = new Set<string>();
        const toVisit = [...initialRoleIds];
        const resolved = new Set<string>();

        while (toVisit.length > 0) {
            const currentId = toVisit.pop();

            if (!currentId || visited.has(currentId)) {
                continue;
            }

            visited.add(currentId);
            resolved.add(currentId);

            // Fetch children (Composite Definition)
            // Table: CompositeRole (parent_role_id, child_role_id)
            const children = await (this.prisma as any).compositeRole.findMany({
                where: {
                    parentRoleId: currentId
                },
                select: {
                    childRoleId: true
                }
            });

            if (children && children.length > 0) {
                children.forEach((c: any) => {
                    if (!visited.has(c.childRoleId)) {
                        toVisit.push(c.childRoleId);
                    }
                });
            }
        }

        return resolved;
    }

    /**
     * Intentionally Not Implemented in this Phase:
     * - Caching (Use Redis in a higher layer)
     * - Wildcard expansion (SAP * logic)
     * - Field-level authorization (Row Level Security logic is separate)
     */
}
