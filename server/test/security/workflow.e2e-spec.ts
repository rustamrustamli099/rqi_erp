
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { JwtAuthGuard } from '../../src/platform/auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core'; // Ensure Reflector is available if needed, usually global

/*
 * WORKFLOW & 4-EYES PRINCIPLE VERIFICATION
 * 
 * Scenario:
 * 1. User A creates a Role (Draft).
 * 2. User A submits the Role (Pending Approval).
 * 3. User A tries to Approve -> EXPECT 403 FORBIDDEN.
 * 4. User B tries to Approve -> EXPECT 201/200 OK.
 */

describe('Role Workflow Security (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let roleId: string;

    // Mock Users
    const USER_A = { userId: 'user-a-uuid', sub: 'user-a-uuid', roles: ['admin'] };
    const USER_B = { userId: 'user-b-uuid', sub: 'user-b-uuid', roles: ['admin'] };

    // Mock Auth Guard
    const mockAuthGuard = {
        canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            const mockUserHeader = req.headers['x-mock-user'];

            if (mockUserHeader === 'USER_A') {
                req.user = USER_A;
                return true;
            } else if (mockUserHeader === 'USER_B') {
                req.user = USER_B;
                return true;
            }
            return false;
        }
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockAuthGuard)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        prisma = app.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        // Cleanup
        if (roleId) {
            await prisma.role.deleteMany({ where: { id: roleId } });
        }
        await app.close();
    });

    it('Step 1: User A creates a Role', async () => {
        const response = await request(app.getHttpServer())
            .post('/admin/roles')
            .set('x-mock-user', 'USER_A')
            .send({
                name: 'E2E_Test_Role_4_Eyes',
                description: 'Testing workflow',
                scope: 'TENANT',
                permissions: []
            })
            .expect(201);

        roleId = response.body.id;
        expect(roleId).toBeDefined();
        expect(response.body.status).toBe('DRAFT');
    });

    it('Step 2: User A submits the Role', async () => {
        await request(app.getHttpServer())
            .post(`/admin/roles/${roleId}/submit`)
            .set('x-mock-user', 'USER_A')
            .expect(201); // or 200

        // Verify status
        const role = await prisma.role.findUnique({ where: { id: roleId } });
        expect(role?.status).toBe('PENDING_APPROVAL');
        expect(role?.submittedById).toBe(USER_A.userId);
    });

    it('Step 3: User A tries to Approve (Should Fail)', async () => {
        await request(app.getHttpServer())
            .post(`/admin/roles/${roleId}/approve`)
            .set('x-mock-user', 'USER_A')
            .expect(403); // Forbidden
    });

    it('Step 4: User B approves the Role (Should Succeed)', async () => {
        await request(app.getHttpServer())
            .post(`/admin/roles/${roleId}/approve`)
            .set('x-mock-user', 'USER_B')
            .expect(201); // or 200

        // Verify status
        const role = await prisma.role.findUnique({ where: { id: roleId } });
        expect(role?.status).toBe('ACTIVE');
        expect(role?.approverId).toBe(USER_B.userId);
    });

});
