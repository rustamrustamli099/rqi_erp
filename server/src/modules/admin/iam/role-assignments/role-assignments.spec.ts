import { Test, TestingModule } from '@nestjs/testing';
import { RoleAssignmentsService } from './application/role-assignments.service';
import { PrismaService } from '../../../../prisma.service';
import { AuditService } from '../../../../system/audit/audit.service';
import { ConflictException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('RoleAssignmentsService (Phase 9 Compliance)', () => {
    let service: RoleAssignmentsService;
    let prisma: any;
    let audit: any;

    const mockPrisma = {
        role: { findUnique: jest.fn() },
        userRoleAssignment: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn()
        }
    };

    const mockAudit = { logAction: jest.fn() };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleAssignmentsService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: AuditService, useValue: mockAudit }
            ],
        }).compile();

        service = module.get<RoleAssignmentsService>(RoleAssignmentsService);
        prisma = module.get<PrismaService>(PrismaService);
        audit = module.get<AuditService>(AuditService);
        jest.clearAllMocks();
    });

    describe('assign', () => {
        const dto = { userId: 'u1', roleId: 'r1' };
        const systemContext = { scopeType: 'SYSTEM', scopeId: null };
        const tenantContext = { scopeType: 'TENANT', scopeId: 't1' };

        it('should throw ConflictException on duplicate assignment', async () => {
            // Setup: Role exists, Assignment exists
            prisma.role.findUnique.mockResolvedValue({ id: 'r1', scope: 'SYSTEM' });
            prisma.userRoleAssignment.findFirst.mockResolvedValue({ id: 'existing1' });

            await expect(service.assign(dto, 'admin', systemContext))
                .rejects.toThrow(ConflictException);
        });

        it('should create assignment if unique', async () => {
            prisma.role.findUnique.mockResolvedValue({ id: 'r1', name: 'Role 1', scope: 'SYSTEM' });
            prisma.userRoleAssignment.findFirst.mockResolvedValue(null);
            prisma.userRoleAssignment.create.mockResolvedValue({ id: 'new1' });

            await service.assign(dto, 'admin', systemContext);

            expect(prisma.userRoleAssignment.create).toHaveBeenCalled();
            expect(audit.logAction).toHaveBeenCalledWith(expect.objectContaining({
                action: 'ROLE_ASSIGNED',
                resource: 'UserRoleAssignment'
            }));
        });

        it('should reject Tenant Admin assigning other Tenant Role', async () => {
            prisma.role.findUnique.mockResolvedValue({ id: 'r1', scope: 'TENANT', tenantId: 't2' });

            await expect(service.assign(dto, 'admin', tenantContext))
                .rejects.toThrow(ForbiddenException);
        });
    });

    describe('listByUser (Scope Explicit)', () => {
        it('should filter by requested scope', async () => {
            const context = { scopeType: 'TENANT', scopeId: 't1' };
            await service.listByUser('u1', context);

            expect(prisma.userRoleAssignment.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    userId: 'u1',
                    scopeType: 'TENANT',
                    scopeId: 't1'
                }
            }));
        });
    });
});
