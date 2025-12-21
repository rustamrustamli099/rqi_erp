
import { PrismaClient } from '@prisma/client';

describe('RBAC Owner Permissions (Strict Enforcement)', () => {
    let prisma: PrismaClient;

    beforeAll(async () => {
        prisma = new PrismaClient();
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should have an Owner role defined in System Scope', async () => {
        const ownerRole = await prisma.role.findFirst({
            where: { name: 'Owner', tenantId: null },
        });
        expect(ownerRole).toBeDefined();
        expect(ownerRole?.name).toBe('Owner');
    });

    it('Owner role must have ALL permissions assigned', async () => {
        const ownerRole = await prisma.role.findFirst({
            where: { name: 'Owner', tenantId: null },
        });
        expect(ownerRole).toBeDefined();

        const allPermissionsCount = await prisma.permission.count();
        expect(allPermissionsCount).toBeGreaterThan(0); // Sanity check

        const ownerPermissionsCount = await prisma.rolePermission.count({
            where: { roleId: ownerRole!.id }
        });

        // Strict Check: Owner must have exactly ALL permissions
        expect(ownerPermissionsCount).toEqual(allPermissionsCount);
    });
});
