import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma.service';
import { RoleStatus } from '@prisma/client';
import { CreateRoleDto } from '../api/dto/create-role.dto';
import { UpdateRoleDto } from '../api/dto/update-role.dto';
import { AuditService } from '../../../../../system/audit/audit.service';
import { ListQueryDto, PaginatedResult } from '../../../../../common/dto/pagination.dto';
import { QueryParser } from '../../../../../common/utils/query-parser';

@Injectable()
export class RolesService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

    async debugCount() {
        // Direct DB Access to Verify State
        const total = await this.prisma.role.count();
        const first = await this.prisma.role.findFirst();
        console.log("DEBUG COUNT:", { total, first });
        return { total, first };
    }

    async create(dto: CreateRoleDto, userId: string) {
        // SAP Rule: Unique name per scope
        const existing = await this.prisma.role.findFirst({
            where: {
                name: { equals: dto.name, mode: 'insensitive' },
                scope: dto.scope as any // Cast to RoleScope enum
            }
        });

        if (existing) {
            throw new BadRequestException(`Role with name '${dto.name}' already exists in ${dto.scope} scope.`);
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
                assigned_permissions: permissionSlugs
            },
            module: 'ACCESS_CONTROL',
            userId: userId,
        });

        return role;
    }

    async findAll(query: ListQueryDto): Promise<PaginatedResult<any>> {
        const { skip, take, orderBy, page, pageSize, search, filters } = QueryParser.parse(query, ['name', 'createdAt', 'level', 'scope', 'status']);

        const where: any = {};

        // 1. Search Logic (Indexed fields only)
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
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
                    _count: { select: { userRoles: true, permissions: true } }
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

    async submitForApproval(id: string, userId: string) {
        const role = await this.findOne(id);
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
        });

        return result;
    }

    async approve(id: string, approverId: string) {
        const role = await this.findOne(id);
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
        });

        return result;
    }

    async reject(id: string, reason: string) {
        const role = await this.findOne(id);
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
            userId: 'SYSTEM', // Usually triggered by a user, but kept as SYSTEM if not passed
        });

        return result;
    }

    async update(id: string, dto: UpdateRoleDto, userId: string = 'SYSTEM') {
        const role = await this.findOne(id);

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
                    id: { not: id }
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
        });

        return updatedRole;
    }
}
