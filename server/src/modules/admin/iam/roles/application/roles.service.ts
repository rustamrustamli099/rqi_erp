import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { RoleStatus } from '@prisma/client';
import { CreateRoleDto } from '../api/dto/create-role.dto';
import { UpdateRoleDto } from '../api/dto/update-role.dto';
import { AuditService } from '../../../../../system/audit/audit.service';
import { ListQueryDto, PaginatedResult } from '../../../../../common/dto/pagination.dto';
import { QueryParser } from '../../../../../common/utils/query-parser';
import { CacheInvalidationService } from '../../../../../platform/cache/cache-invalidation.service';

/**
 * ROLES SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PHASE 10.4: Cache invalidation hooks added.
 * 
 * On update/remove: getAffectedUsers() is called, then invalidateUser() for each.
 * ═══════════════════════════════════════════════════════════════════════════
 */
@Injectable()
export class RolesService {
    private readonly logger = new Logger(RolesService.name);

    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
        private cacheInvalidation: CacheInvalidationService
    ) { }

    async debugCount() {
        // Direct DB Access to Verify State
        const total = await this.prisma.role.count();
        const first = await this.prisma.role.findFirst();
        console.log("DEBUG COUNT:", { total, first });
        return { total, first };
    }

    async create(dto: CreateRoleDto, userId: string, context: { scopeType: string, scopeId: string | null }) {
        // [PFCG] Strict Ownership Enforcement
        // 1. Tenant User can ONLY create Tenant Roles for THEIR Tenant
        if (context.scopeType === 'TENANT') {
            if (dto.scope !== 'TENANT') {
                throw new ForbiddenException('Security Violation: Tenant users can only create TENANT scoped roles.');
            }
            // Force Tenant ID from Context (Ignore DTO if passed)
            // validation against context.scopeId needed? context.scopeId is the source of truth.
        }

        // 2. System User can create SYSTEM or TENANT roles
        // If System User creates TENANT role, they implies global provisioning (rare but possible).
        // For now, allow mixed, but ensure data integrity.

        const effectiveTenantId = context.scopeType === 'TENANT' ? context.scopeId : null;
        // NOTE: If System Admin creates a Tenant Role, we might need a target tenantId in DTO. 
        // For this phase, we assume System Admins create SYSTEM roles, and Tenant Admins create TENANT roles.
        // If a System Admin wants to create a Tenant Role, they should Switch Context to that Tenant first.

        // SAP Rule: Unique name per scope + tenant
        const existing = await this.prisma.role.findFirst({
            where: {
                name: { equals: dto.name, mode: 'insensitive' },
                scope: dto.scope as any, // Cast to RoleScope enum
                tenantId: effectiveTenantId
            }
        });

        if (existing) {
            throw new BadRequestException(`Role with name '${dto.name}' already exists in this scope.`);
        }

        // Resolve Permissions if provided
        let permissionConnect: { permissionId: string }[] = [];
        let permissionSlugs: string[] = [];

        if (dto.permissionIds && dto.permissionIds.length > 0) {
            // Deduplicate input
            const uniqueSlugs = [...new Set(dto.permissionIds)];
            permissionSlugs = uniqueSlugs;

            // Fetch permissions by SLUGS to get UUIDs
            const permissions = await this.prisma.permission.findMany({
                where: {
                    slug: { in: uniqueSlugs }
                }
            });

            // STRICT SCOPE ENFORCEMENT
            const invalidPermissions = permissions.filter(p => {
                if (dto.scope === 'SYSTEM' && p.scope === 'TENANT') return true;
                if (dto.scope === 'TENANT' && p.scope === 'SYSTEM') return true;
                return false;
            });

            if (invalidPermissions.length > 0) {
                throw new BadRequestException(`Security Violation: Attempted to assign invalid scope permissions to ${dto.scope} role: ${invalidPermissions.map(p => p.slug).join(', ')}`);
            }

            permissionConnect = permissions.map(p => ({
                permissionId: p.id
            }));
        }

        const role = await this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                scope: dto.scope as any,
                tenantId: effectiveTenantId, // [CRITICAL] Bind to Tenant
                level: 10,
                isLocked: false,
                isEnabled: true,
                isSystem: dto.scope === 'SYSTEM',
                status: RoleStatus.DRAFT, // Always created as DRAFT
                createdById: userId, // Track Creator
                submittedById: userId,
                // Direct Insertion of Permissions
                permissions: {
                    createMany: {
                        data: permissionConnect
                    }
                }
            }
        });

        await this.auditService.logAction({
            action: 'ROLE_CREATED',
            resource: 'Role',
            details: {
                roleId: role.id,
                name: role.name,
                scope: role.scope,
                tenantId: effectiveTenantId,
                assigned_permissions: permissionSlugs
            },
            module: 'ACCESS_CONTROL',
            userId: userId,
            tenantId: effectiveTenantId || undefined
        });

        return role;
    }

    async findAll(query: ListQueryDto, context?: { scopeType: string, scopeId: string | null }): Promise<PaginatedResult<any>> {
        const { skip, take, orderBy, page, pageSize, search, filters } = QueryParser.parse(query, ['name', 'createdAt', 'level', 'scope', 'status']);

        const where: any = {};

        // [PFCG] Compliance: Visibility Scoping
        if (context) {
            if (context.scopeType === 'TENANT') {
                // Tenant sees:
                // 1. Own Tenant Roles
                // 2. System Roles (Global available reference) - [Policy Decision: Can they see system roles? Yes, usually for assignment/reading]
                where.OR = [
                    { tenantId: context.scopeId },
                    { scope: 'SYSTEM' } // System roles are visible to all (usually)
                ];
            }
            // System sees everything by default, or specific tenant if filtered.
        }

        // 1. Search Logic (Indexed fields only)
        if (search) {
            where.AND = [
                ...(where.OR ? [{ OR: where.OR }] : []), // Preserve scope restriction if exists
                {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ]
                }
            ];
            delete where.OR; // Clean up top-level OR if moved to AND
        }

        // 2. Filter Logic (Explicit Parsing per module schema)
        if (filters) {
            if (filters.scope) where.scope = filters.scope;
            if (filters.status) where.status = filters.status;
            // Add other role-specific filters here
        }

        console.log("RolesService.findAll [SAP-Grade]:", { where, skip, take, orderBy });

        const [items, total] = await Promise.all([
            this.prisma.role.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    _count: { select: { userRoles: true, permissions: true } },
                    permissions: { include: { permission: true } }
                }
            }),
            this.prisma.role.count({ where })
        ]);

        return {
            items,
            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            },
            query: {
                sortBy: Object.keys(orderBy)[0],
                sortDir: Object.values(orderBy)[0] as string,
                search,
                filters
            }
        };
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: { permission: true }
                }
            }
        });
        if (!role) throw new NotFoundException('Role not found');
        return role;
    }

    async submitForApproval(id: string, userId: string, context: { scopeType: string, scopeId: string | null }) {
        const role = await this.findOne(id);
        this.verifyOwnership(role, context, 'submit');

        if (role.status !== RoleStatus.DRAFT && role.status !== RoleStatus.REJECTED) {
            throw new BadRequestException('Only Draft or Rejected roles can be submitted');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: RoleStatus.PENDING_APPROVAL,
                submittedById: userId
            }
        });

        await this.auditService.logAction({
            action: 'ROLE_SUBMITTED',
            resource: 'Role',
            details: { roleId: id },
            module: 'ACCESS_CONTROL',
            userId: userId,
            tenantId: role.tenantId || undefined
        });

        return result;
    }

    async approve(id: string, approverId: string, context: { scopeType: string, scopeId: string | null }) {
        const role = await this.findOne(id);
        this.verifyOwnership(role, context, 'approve');

        if (role.status !== RoleStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Role is not pending approval');
        }

        if (role.submittedById === approverId || role.createdById === approverId) {
            throw new ForbiddenException('Security Violation: 4-Eyes Principle. You cannot approve a role you created or submitted.');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: RoleStatus.ACTIVE,
                approverId,
                approvalNote: null
            }
        });

        await this.auditService.logAction({
            action: 'ROLE_APPROVED',
            resource: 'Role',
            details: { roleId: id, approverId },
            module: 'ACCESS_CONTROL',
            userId: approverId,
            tenantId: role.tenantId || undefined
        });

        return result;
    }

    async reject(id: string, reason: string, userId: string = 'SYSTEM', context: { scopeType: string, scopeId: string | null }) {
        const role = await this.findOne(id);
        this.verifyOwnership(role, context, 'reject');

        if (role.status !== RoleStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Role is not pending approval');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: RoleStatus.REJECTED,
                approvalNote: reason
            }
        });

        await this.auditService.logAction({
            action: 'ROLE_REJECTED',
            resource: 'Role',
            details: { roleId: id, reason },
            module: 'ACCESS_CONTROL',
            userId: userId,
            tenantId: role.tenantId || undefined
        });

        return result;
    }


    async update(id: string, dto: UpdateRoleDto, userId: string = 'SYSTEM', context: { scopeType: string, scopeId: string | null }) {
        const role = await this.findOne(id);
        this.verifyOwnership(role, context, 'update');

        // Locked Role Check (SAP Standard)
        if (role.isLocked) {
            throw new ForbiddenException('Cannot edit a locked System Role.');
        }

        // Scope Immutability Check
        if (dto.scope && dto.scope !== role.scope) {
            throw new BadRequestException('Role Scope cannot be changed once created.');
        }

        let newStatus = role.status;
        const auditDetails: any = { roleId: id };

        // Handle Permissions (FULL REPLACE DIFF LOGIC)
        if (dto.permissionIds) {
            // 1. Current Permissions (Old State)
            const oldPermissionsMap = new Map<string, string>(); // Slug -> UUID
            role.permissions.forEach(rp => {
                oldPermissionsMap.set(rp.permission.slug, rp.permissionId);
            });
            const oldSlugs = Array.from(oldPermissionsMap.keys());

            // 2. New Permissions (New State) - From Payload
            let newSlugsUnique = [...new Set(dto.permissionIds)]; // Dedupe

            // --- AUTO-READ RULE (SAP / Oracle Standard) ---
            // If any action exists (create, update, delete, etc.), ensure 'read' is present.
            // Heuristic: Replace last segment with 'read' OR 'view' (based on convention).
            // Convention Check: Most are *.read, some might be *.view. 
            // We'll perform a DB lookup optimization: If we generate a slug, does it exist?

            // 2a. Generate Potential Read Slugs
            const potentialReadSlugs = new Set<string>();
            newSlugsUnique.forEach(slug => {
                const parts = slug.split('.');
                if (parts.length > 1) {
                    const action = parts[parts.length - 1];
                    // If action is NOT read/view, we propose read/view
                    if (action !== 'read' && action !== 'view') {
                        const base = parts.slice(0, parts.length - 1).join('.');
                        potentialReadSlugs.add(`${base}.read`);
                        potentialReadSlugs.add(`${base}.view`);
                    }
                }
            });

            // 2b. Verify which actually exist in DB
            if (potentialReadSlugs.size > 0) {
                const existingReadPerms = await this.prisma.permission.findMany({
                    where: { slug: { in: Array.from(potentialReadSlugs) } },
                    select: { slug: true }
                });

                // 2c. Add valid implicit read permissions
                existingReadPerms.forEach(p => {
                    if (!newSlugsUnique.includes(p.slug)) {
                        newSlugsUnique.push(p.slug);
                    }
                });
            }
            // ----------------------------------------------

            const validNewPermissions = await this.prisma.permission.findMany({
                where: { slug: { in: newSlugsUnique } }
            });

            const newPermissionsMap = new Map<string, string>(); // Slug -> UUID
            validNewPermissions.forEach(p => {
                newPermissionsMap.set(p.slug, p.id);
            });
            const newSlugs = Array.from(newPermissionsMap.keys());

            // 3. Strict Scope Check
            const invalidScopePerms = validNewPermissions.filter(p => {
                if (role.scope === 'SYSTEM' && p.scope === 'TENANT') return true;
                if (role.scope === 'TENANT' && p.scope === 'SYSTEM') return true;
                return false;
            });
            if (invalidScopePerms.length > 0) {
                throw new BadRequestException(`Security Violation: Invalid scope permissions for ${role.scope}: ${invalidScopePerms.map(p => p.slug).join(', ')}`);
            }

            // 4. Calculate DIFF
            const slugsToRemove = oldSlugs.filter(s => !newSlugs.includes(s));
            const slugsToAdd = newSlugs.filter(s => !oldSlugs.includes(s));

            const idsToRemove = slugsToRemove.map(s => oldPermissionsMap.get(s)).filter(Boolean) as string[];
            const idsToAdd = slugsToAdd.map(s => newPermissionsMap.get(s)).filter(Boolean) as string[];

            // 5. Atomic Execution
            await this.prisma.$transaction(async (tx) => {
                if (idsToRemove.length > 0) {
                    await tx.rolePermission.deleteMany({
                        where: {
                            roleId: id,
                            permissionId: { in: idsToRemove }
                        }
                    });
                }

                if (idsToAdd.length > 0) {
                    await tx.rolePermission.createMany({
                        data: idsToAdd.map(permId => ({
                            roleId: id,
                            permissionId: permId
                        }))
                    });
                }
            });

            // 6. Audit Data Preparation
            auditDetails.permission_changes = {
                before: oldSlugs.sort(),
                after: newSlugs.sort(),
                removed: slugsToRemove,
                added: slugsToAdd
            };

            // Force status update if permissions changed
            if (slugsToRemove.length > 0 || slugsToAdd.length > 0) {
                if (role.status === RoleStatus.ACTIVE) {
                    newStatus = RoleStatus.DRAFT;
                }
            }
        }

        // [PFCG] Composite Role Logic
        if (dto.childRoleIds) {
            // 1. Current Children
            const currentChildren = await (this.prisma as any).compositeRole.findMany({
                where: { parentRoleId: id }
            });
            const oldChildIds = currentChildren.map(c => c.childRoleId);

            // 2. New Children - Dedupe
            const newChildIds = [...new Set(dto.childRoleIds)];

            // 3. Validation: Ownership & Scope
            if (newChildIds.length > 0) {
                const invalidChildren = await this.prisma.role.findMany({
                    where: {
                        id: { in: newChildIds },
                        // Scope Check: Can only add roles visible to this scope
                        // Tenant can add: Own Tenant Roles OR System Roles ?
                        // SAP Rule: Composite Role can contain Single Roles.
                        // Ideally: Tenant Role -> Contains Tenant Roles OR System Roles (if System roles are templates/usable)
                        // But System Role -> Can ONLY contain System Roles.
                        OR: context.scopeType === 'SYSTEM'
                            ? [{ scope: 'TENANT' }] // System Role cannot contain Tenant Role
                            : []
                    }
                });

                if (context.scopeType === 'SYSTEM' && invalidChildren.length > 0) {
                    // Wait, the logic above is inverse. 
                    // If I am System, I want to Find Roles that are TENANT (Invalid).
                    throw new BadRequestException(`System Roles cannot contain Tenant Roles.`);
                }

                // If Tenant: Can I add System Role? Yes. Can I add other Tenant Role? No.
                if (context.scopeType === 'TENANT') {
                    const alienRoles = await this.prisma.role.findMany({
                        where: {
                            id: { in: newChildIds },
                            AND: [
                                { scope: 'TENANT' },
                                { tenantId: { not: context.scopeId } }
                            ]
                        }
                    });
                    if (alienRoles.length > 0) {
                        throw new BadRequestException(`Security Violation: Cannot include roles from another tenant.`);
                    }
                }
            }

            // 4. Cycle Detection
            // If I add Child C to Parent P, does C already contain P (deeply)?
            for (const childId of newChildIds) {
                const hasCycle = await this.detectCycle(childId, id);
                if (hasCycle) {
                    throw new BadRequestException(`Cycle Detected: Role ${childId} already contains ${id} recursively.`);
                }
            }

            // 5. Diff
            const kidsToRemove = oldChildIds.filter(c => !newChildIds.includes(c));
            const kidsToAdd = newChildIds.filter(c => !oldChildIds.includes(c));

            await this.prisma.$transaction(async (tx) => {
                if (kidsToRemove.length > 0) {
                    await (tx as any).compositeRole.deleteMany({
                        where: {
                            parentRoleId: id,
                            childRoleId: { in: kidsToRemove }
                        }
                    });
                }
                if (kidsToAdd.length > 0) {
                    await (tx as any).compositeRole.createMany({
                        data: kidsToAdd.map(cid => ({
                            parentRoleId: id,
                            childRoleId: cid
                        }))
                    });
                }
            });

            auditDetails.child_roles = {
                removed: kidsToRemove,
                added: kidsToAdd
            };
        }

        // Handle other fields (Name, Description)
        // We separate this to ensure permission transaction logic is clean, 
        // though typically this could be inside the same transaction.
        // For SAP-grade safety, wrapping everything in a transaction is better, 
        // but Prisma's interactive transactions are used above for the critical permission part.
        // We will do a final update for scalar fields.

        const updateData: any = {};
        if (dto.name) updateData.name = dto.name;
        if (dto.description !== undefined) updateData.description = dto.description;
        updateData.status = newStatus;

        if (dto.name && dto.name !== role.name) {
            // Check name uniqueness again if changing
            const existing = await this.prisma.role.findFirst({
                where: {
                    name: { equals: dto.name, mode: 'insensitive' },
                    scope: role.scope,
                    id: { not: id },
                    tenantId: role.tenantId // Scope Check
                }
            });
            if (existing) throw new BadRequestException(`Role name '${dto.name}' is already taken.`);
        }

        const updatedRole = await this.prisma.role.update({
            where: { id },
            data: updateData,
            include: { permissions: { include: { permission: true } } }
        });

        await this.auditService.logAction({
            action: 'ROLE_UPDATED',
            resource: 'Role',
            details: auditDetails,
            module: 'ACCESS_CONTROL',
            userId: userId,
            tenantId: role.tenantId || undefined
        });

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 10.4: CACHE INVALIDATION (SYNCHRONOUS, BEFORE RESPONSE)
        // ═══════════════════════════════════════════════════════════════════
        const affectedUsers = await this.getAffectedUsers(id);
        await this.cacheInvalidation.invalidateUsers(affectedUsers);
        this.logger.log(`Cache invalidated for ${affectedUsers.length} users after role update`);

        return updatedRole;
    }

    async remove(id: string, userId: string, context: { scopeType: string, scopeId: string | null }) {
        const role = await this.findOne(id);
        this.verifyOwnership(role, context, 'delete');

        // Prevent deleting System Roles if not System Admin? 
        // verifyOwnership handles scope check.
        // Additional check: Locked roles
        if (role.isLocked) {
            throw new ForbiddenException('Cannot delete a locked System Role.');
        }

        // Check Assignments
        const assignmentCount = await this.prisma.userRole.count({ where: { roleId: id } });
        if (assignmentCount > 0) {
            throw new BadRequestException(`Cannot delete role '${role.name}' because it has ${assignmentCount} active assignments.`);
        }

        // PHASE 10.4: Get affected users BEFORE deletion
        const affectedUsers = await this.getAffectedUsers(id);

        await this.prisma.$transaction([
            this.prisma.rolePermission.deleteMany({ where: { roleId: id } }),
            this.prisma.role.delete({ where: { id } })
        ]);

        await this.auditService.logAction({
            action: 'ROLE_DELETED',
            resource: 'Role',
            details: { roleId: id, name: role.name },
            module: 'ACCESS_CONTROL',
            userId: userId,
            tenantId: role.tenantId || undefined
        });

        // ═══════════════════════════════════════════════════════════════════
        // PHASE 10.4: CACHE INVALIDATION (SYNCHRONOUS, BEFORE RESPONSE)
        // Note: affectedUsers collected BEFORE deletion transaction
        // ═══════════════════════════════════════════════════════════════════
        await this.cacheInvalidation.invalidateUsers(affectedUsers);
        this.logger.log(`Cache invalidated for ${affectedUsers.length} users after role deletion`);

        return { success: true };
    }

    /**
     * PRIVATE helper to enforce ownership
     */
    private verifyOwnership(role: any, context: { scopeType: string, scopeId: string | null }, action: string) {
        if (context.scopeType === 'TENANT') {
            // Tenant Users can only touch their OWN roles
            // 1. Role must be TENANT scoped (System roles are Read-Only for tenants, enforced by service logic usually, but here we cover mutations)
            if (role.scope === 'SYSTEM') {
                throw new ForbiddenException(`Security Violation: Tenant cannot ${action} a SYSTEM role.`);
            }
            // 2. Role must belong to the same tenant
            if (role.tenantId !== context.scopeId) {
                // Should act as Not Found to prevent enumeration? Or explicit Forbidden?
                // For Admin UI, Forbidden is often clearer, but strictly 404 is safer.
                // Given we already did findOne which doesn't check filter, we do check here.
                throw new ForbiddenException(`Security Violation: You do not have access to this role.`);
            }
        }
    }

    private async detectCycle(startNodeId: string, targetNodeId: string): Promise<boolean> {
        // BFS/DFS to see if startNodeId can reach targetNodeId
        // startNodeId is the Child we are adding.
        // targetNodeId is the Parent.
        // If Child contains Parent, then adding Child to Parent creates a loop.

        const toVisit = [startNodeId];
        const visited = new Set<string>();

        while (toVisit.length > 0) {
            const current = toVisit.pop();
            if (!current || visited.has(current)) continue;

            visited.add(current);

            if (current === targetNodeId) return true;

            const children = await (this.prisma as any).compositeRole.findMany({
                where: { parentRoleId: current },
                select: { childRoleId: true }
            });

            for (const c of children) {
                if (!visited.has(c.childRoleId)) {
                    toVisit.push(c.childRoleId);
                }
            }
        }
        return false;
    }

    /**
     * PHASE 10.4: Get all users affected by role changes.
     * 
     * This computes users who have this role directly assigned.
     * For composite roles, it also includes users with parent roles.
     */
    private async getAffectedUsers(roleId: string): Promise<string[]> {
        // 1. Direct assignments via UserRoleAssignment
        const directAssignments = await (this.prisma as any).userRoleAssignment.findMany({
            where: { roleId: roleId },
            select: { userId: true }
        });

        const userIds = new Set<string>(directAssignments.map((a: any) => a.userId));

        // 2. If this role is a child in composite roles, get parent roles recursively
        const parentRoles = await this.getParentRoles(roleId);

        for (const parentRoleId of parentRoles) {
            const parentAssignments = await (this.prisma as any).userRoleAssignment.findMany({
                where: { roleId: parentRoleId },
                select: { userId: true }
            });
            parentAssignments.forEach((a: any) => userIds.add(a.userId));
        }

        return Array.from(userIds);
    }

    /**
     * Get all parent roles recursively (for composite role invalidation).
     */
    private async getParentRoles(roleId: string): Promise<string[]> {
        const parentIds = new Set<string>();
        const toVisit = [roleId];

        while (toVisit.length > 0) {
            const current = toVisit.pop();
            if (!current) continue;

            const parents = await (this.prisma as any).compositeRole.findMany({
                where: { childRoleId: current },
                select: { parentRoleId: true }
            });

            for (const p of parents) {
                if (!parentIds.has(p.parentRoleId)) {
                    parentIds.add(p.parentRoleId);
                    toVisit.push(p.parentRoleId);
                }
            }
        }

        return Array.from(parentIds);
    }
}