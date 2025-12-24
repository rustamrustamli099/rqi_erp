import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionsService } from './role-permissions.service';
import { PrismaService } from '../../../../../prisma.service';
import { AuditService } from '../../../../../system/audit/audit.service';
import { NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';

const mockPrismaService = {
    role: { findUnique: jest.fn(), update: jest.fn() },
    permission: { findMany: jest.fn() },
    rolePermission: { deleteMany: jest.fn(), createMany: jest.fn() },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
};

const mockAuditService = {
    logAction: jest.fn(),
};

describe('RolePermissionsService', () => {
    let service: RolePermissionsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolePermissionsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AuditService, useValue: mockAuditService },
            ],
        }).compile();

        service = module.get<RolePermissionsService>(RolePermissionsService);
        jest.clearAllMocks();
    });

    const mockRole = (overrides = {}) => ({
        id: 'role-1',
        name: 'Test Role',
        scope: 'TENANT',
        isLocked: false,
        version: 1,
        status: 'DRAFT',
        permissions: [],
        ...overrides
    });

    const mockPerm = (slug, scope = 'TENANT') => ({ id: `id-${slug}`, slug, scope });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('updateRolePermissions', () => {
        it('should throw NotFoundException if role does not exist', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(null);
            await expect(service.updateRolePermissions('user-1', 'role-x', { expectedVersion: 1, permissionSlugs: [] }))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if role is locked', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole({ isLocked: true }));
            await expect(service.updateRolePermissions('user-1', 'role-1', { expectedVersion: 1, permissionSlugs: [] }))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw ConflictException (409) if version mismatch', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole({ version: 5 }));
            await expect(service.updateRolePermissions('user-1', 'role-1', { expectedVersion: 4, permissionSlugs: [] }))
                .rejects.toThrow(ConflictException);
        });

        it('should throw BadRequestException if unknown permissions requested', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole());
            mockPrismaService.permission.findMany.mockResolvedValue([mockPerm('perm.a')]); // perm.b missing

            await expect(service.updateRolePermissions('user-1', 'role-1', { expectedVersion: 1, permissionSlugs: ['perm.a', 'perm.b'] }))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if scope mismatch', async () => {
            mockPrismaService.role.findUnique.mockResolvedValue(mockRole({ scope: 'SYSTEM' }));
            mockPrismaService.permission.findMany.mockResolvedValue([mockPerm('perm.tenant', 'TENANT')]);

            await expect(service.updateRolePermissions('user-1', 'role-1', { expectedVersion: 1, permissionSlugs: ['perm.tenant'] }))
                .rejects.toThrow(BadRequestException);
        });

        it('should calculate Diff and Audit correctly (Update)', async () => {
            // Setup: Role has A, B. Requesting A, C. Result: Remove B, Add C.
            const role = mockRole({
                permissions: [
                    { permissionId: 'id-perm.a', permission: mockPerm('perm.a') },
                    { permissionId: 'id-perm.b', permission: mockPerm('perm.b') }
                ]
            });
            mockPrismaService.role.findUnique.mockResolvedValue(role);

            const newPerms = [mockPerm('perm.a'), mockPerm('perm.c')];
            mockPrismaService.permission.findMany.mockResolvedValue(newPerms);

            mockPrismaService.role.update.mockResolvedValue({ ...role, version: 2 });

            const result = await service.updateRolePermissions('user-1', 'role-1', { expectedVersion: 1, permissionSlugs: ['perm.a', 'perm.c'] });

            // Verify Diff Logic
            // Remove B
            expect(mockPrismaService.rolePermission.deleteMany).toHaveBeenCalledWith({
                where: { roleId: 'role-1', permissionId: { in: ['id-perm.b'] } }
            });
            // Add C
            expect(mockPrismaService.rolePermission.createMany).toHaveBeenCalledWith({
                data: [{ roleId: 'role-1', permissionId: 'id-perm.c' }]
            });

            // Verify Version Bump
            expect(mockPrismaService.role.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ version: { increment: 1 } })
            }));

            // Verify Audit
            expect(mockAuditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
                action: 'ROLE_PERMISSIONS_UPDATED',
                details: expect.objectContaining({
                    removed: ['perm.b'],
                    added: ['perm.c'],
                    before: ['perm.a', 'perm.b'],
                    after: ['perm.a', 'perm.c']
                })
            }));
        });

        it('should handle Empty Assignment (Clear All)', async () => {
            const role = mockRole({
                permissions: [{ permissionId: 'id-perm.a', permission: mockPerm('perm.a') }]
            });
            mockPrismaService.role.findUnique.mockResolvedValue(role);
            mockPrismaService.role.update.mockResolvedValue({ ...role, version: 2 });

            await service.updateRolePermissions('user-1', 'role-1', { expectedVersion: 1, permissionSlugs: [] });

            expect(mockPrismaService.rolePermission.deleteMany).toHaveBeenCalled();
            expect(mockPrismaService.rolePermission.createMany).not.toHaveBeenCalled();
            expect(mockAuditService.logAction).toHaveBeenCalled();
        });
    });
});
