import { Test, TestingModule } from '@nestjs/testing';
import { EffectivePermissionsService } from './effective-permissions.service';
import { PrismaService } from '../../prisma.service';

/**
 * SAP-GRADE COMPLIANCE TESTS (PHASE 6.1)
 * 
 * Enforcing the SAP PFCG Matrix:
 * 1. Direct Role Assignment (Baseline)
 * 2. Composite Role Resolution (Expansion)
 * 3. Cycle Detection (Safety)
 * 4. Scope Isolation (Tenant Safety)
 * 5. No Implicit Global (System != Tenant)
 * 6. Deduplication & Exact Match (Cleanup)
 */

describe('EffectivePermissionsService (SAP PFCG Compliance)', () => {
    let service: EffectivePermissionsService;
    let prisma: any;

    const mockPrismaService = {
        userRoleAssignment: { findMany: jest.fn() },
        compositeRole: { findMany: jest.fn() },
        rolePermission: { findMany: jest.fn() }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EffectivePermissionsService,
                { provide: PrismaService, useValue: mockPrismaService }
            ],
        }).compile();

        service = module.get<EffectivePermissionsService>(EffectivePermissionsService);
        prisma = module.get<PrismaService>(PrismaService);

        // Reset mocks to clean state
        jest.clearAllMocks();
    });

    // =========================================================================
    // TEST 1 — DIRECT ROLE ASSIGNMENT (BASELINE)
    // Expect: computeEffectivePermissions(U, TENANT, A) → contains EXACTLY ['invoice.read']
    // =========================================================================
    it('TEST 1: Direct Role Assignment - Should resolve specific permissions for valid assignment', async () => {
        const userId = 'user-1';
        const tenantId = 'tenant-A';
        const roleId = 'role-basic';
        const perms = ['invoice.read'];

        // Mock Assignment
        prisma.userRoleAssignment.findMany.mockResolvedValue([
            { roleId: roleId }
        ]);

        // Mock No Composite Children
        prisma.compositeRole.findMany.mockResolvedValue([]);

        // Mock Permissions
        prisma.rolePermission.findMany.mockResolvedValue([
            { permissionSlug: 'invoice.read' }
        ]);

        const result = await service.computeEffectivePermissions({
            userId, scopeType: 'TENANT', scopeId: tenantId
        });

        expect(prisma.userRoleAssignment.findMany).toHaveBeenCalledWith({
            where: { userId, scopeType: 'TENANT', scopeId: tenantId },
            select: { roleId: true }
        });
        expect(result).toEqual(perms);
    });

    // =========================================================================
    // TEST 2 — COMPOSITE ROLE RESOLUTION (EXPANSION)
    // Expect: Admin (includes Billing) -> ['invoice.read', 'invoice.create']
    // =========================================================================
    it('TEST 2: Composite Role Resolution - Should expand parent roles to children permissions', async () => {
        const userId = 'user-admin';
        const adminRole = 'role-admin';
        const billingRole = 'role-billing';

        prisma.userRoleAssignment.findMany.mockResolvedValue([{ roleId: adminRole }]);

        // Composite Logic: Admin has child Billing
        prisma.compositeRole.findMany.mockImplementation((args: any) => {
            if (args.where.parentRoleId === adminRole) return Promise.resolve([{ childRoleId: billingRole }]);
            return Promise.resolve([]);
        });

        // Permissions: Billing has the actual perms
        prisma.rolePermission.findMany.mockImplementation((args: any) => {
            const requestedRoles = args.where.roleId.in;
            const foundPerms = [];
            if (requestedRoles.includes(billingRole)) {
                foundPerms.push({ permissionSlug: 'invoice.read' });
                foundPerms.push({ permissionSlug: 'invoice.create' });
            }
            return Promise.resolve(foundPerms);
        });

        const result = await service.computeEffectivePermissions({
            userId, scopeType: 'TENANT', scopeId: 'tenant-A'
        });

        expect(result).toEqual(['invoice.create', 'invoice.read']); // Sorted
    });

    // =========================================================================
    // TEST 3 — CYCLE DETECTION (CRITICAL)
    // Setup: Role A <-> Role B. 
    // Expect: No hang, full permissions.
    // =========================================================================
    it('TEST 3: Cycle Detection - Should traverse cyclic graphs without hanging', async () => {
        const roleA = 'role-A';
        const roleB = 'role-B';

        prisma.userRoleAssignment.findMany.mockResolvedValue([{ roleId: roleA }]);

        // Cycle: A -> B, B -> A
        prisma.compositeRole.findMany.mockImplementation((args: any) => {
            if (args.where.parentRoleId === roleA) return Promise.resolve([{ childRoleId: roleB }]);
            if (args.where.parentRoleId === roleB) return Promise.resolve([{ childRoleId: roleA }]);
            return Promise.resolve([]);
        });

        prisma.rolePermission.findMany.mockResolvedValue([
            { permissionSlug: 'perm.a' }, // from A
            { permissionSlug: 'perm.b' }  // from B
        ]);

        const result = await service.computeEffectivePermissions({
            userId: 'u', scopeType: 'TENANT', scopeId: 't'
        });

        expect(result).toEqual(['perm.a', 'perm.b']);
    });

    // =========================================================================
    // TEST 4 — SCOPE ISOLATION (TENANT SAFETY)
    // Assignment in Tenant A != Tenant B
    // =========================================================================
    it('TEST 4: Scope Isolation - Should return empty for tenant with no assignments', async () => {
        const userId = 'u';
        const tenantA = 'tenant-A';
        const tenantB = 'tenant-B';

        // Mock: specific response based on scopeId
        prisma.userRoleAssignment.findMany.mockImplementation((args: any) => {
            if (args.where.scopeId === tenantA) return Promise.resolve([{ roleId: 'role-A' }]);
            if (args.where.scopeId === tenantB) return Promise.resolve([]); // NO ROLES HERE
            return Promise.resolve([]);
        });

        prisma.rolePermission.findMany.mockResolvedValue([{ permissionSlug: 'x' }]);

        // Act 1: Tenant A (Has Role)
        const resultA = await service.computeEffectivePermissions({
            userId, scopeType: 'TENANT', scopeId: tenantA
        });
        expect(resultA).toHaveLength(1);

        // Act 2: Tenant B (No Role)
        const resultB = await service.computeEffectivePermissions({
            userId, scopeType: 'TENANT', scopeId: tenantB
        });
        expect(resultB).toEqual([]); // Must be empty
    });

    // =========================================================================
    // TEST 5 — NO IMPLICIT GLOBAL
    // Tenant Role does not imply System fallback
    // =========================================================================
    it('TEST 5: No Implicit Global - Should NOT fallback to global scope', async () => {
        const userId = 'u';

        prisma.userRoleAssignment.findMany.mockImplementation((args: any) => {
            if (args.where.scopeType === 'SYSTEM') return Promise.resolve([]); // No system roles
            // User *does* have tenant roles, but we shouldn't see them here
            return Promise.resolve([{ roleId: 'tenant-role' }]);
        });

        const result = await service.computeEffectivePermissions({
            userId, scopeType: 'SYSTEM', scopeId: null
        });

        expect(result).toEqual([]);
    });

    // =========================================================================
    // TEST 6 — DEDUPLICATION + EXACT MATCH
    // Setup: Role A & Role B both grant 'invoice.read'. Role B also 'invoice.read.extra'.
    // Expect: 'invoice.read' once.
    // =========================================================================
    it('TEST 6: Deduplication - Should return unique exact-match permissions', async () => {
        const roleA = 'role-A';
        const roleB = 'role-B';

        prisma.userRoleAssignment.findMany.mockResolvedValue([
            { roleId: roleA },
            { roleId: roleB }
        ]);

        prisma.compositeRole.findMany.mockResolvedValue([]);

        // Mock: Both return permissions, some overlap
        // Notice: `findMany` is called with { roleId: { in: [Array] } }
        // We simulate the DB returning the union of permissions
        prisma.rolePermission.findMany.mockResolvedValue([
            { permissionSlug: 'invoice.read' },       // from Role A
            { permissionSlug: 'invoice.read' },       // from Role B (Duplicate)
            { permissionSlug: 'invoice.read.extra' }  // from Role B (Unique)
        ]);

        const result = await service.computeEffectivePermissions({
            userId: 'u', scopeType: 'TENANT', scopeId: 't'
        });

        // Deduped and Sorted
        expect(result).toEqual(['invoice.read', 'invoice.read.extra']);
        expect(result.filter(p => p === 'invoice.read').length).toBe(1);
    });
});
