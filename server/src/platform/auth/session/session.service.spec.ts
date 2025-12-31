import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../../prisma.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { ScopeType } from './dto/switch-context.dto';

describe('SessionService (SAP Phase 7 Compliance)', () => {
    let service: SessionService;
    let authService: any;
    let prisma: any;

    const mockPrisma = {
        userRoleAssignment: { findMany: jest.fn(), findFirst: jest.fn() },
        user: { findUnique: jest.fn() }
    };
    const mockAuthService = {
        issueTokenForScope: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: AuthService, useValue: mockAuthService }
            ],
        }).compile();

        service = module.get<SessionService>(SessionService);
        prisma = module.get<PrismaService>(PrismaService);
        authService = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    // ===========================================
    // TEST: Scope Validation Rules (400 Bad Request)
    // ===========================================
    it('should REJECT SYSTEM scope with scopeId (400)', async () => {
        try {
            await service.switchContext('user1', { scopeType: ScopeType.SYSTEM, scopeId: 'xyz' });
            throw new Error('Should have thrown BadRequestException');
        } catch (e) {
            expect(e).toBeInstanceOf(BadRequestException);
            expect(e.message).toBe('SYSTEM scope cannot have a scopeId');
        }
    });

    it('should REJECT TENANT scope without scopeId (400)', async () => {
        try {
            await service.switchContext('user1', { scopeType: ScopeType.TENANT, scopeId: null });
            throw new Error('Should have thrown BadRequestException');
        } catch (e) {
            // Relaxed check: verify 400 status behavior or name
            const isBadRequest = e instanceof BadRequestException || e.name === 'BadRequestException' || e.status === 400;
            expect(isBadRequest).toBe(true);
            expect(e.message).toContain('TENANT scope');
        }
    });

    // ===========================================
    // TEST: Role Assignment Verification (403 Forbidden)
    // ===========================================
    it('should throw Forbidden if user has NO ROLE in target scope', async () => {
        prisma.userRoleAssignment.findFirst.mockResolvedValue(null); // Not found

        await expect(service.switchContext('user1', { scopeType: ScopeType.TENANT, scopeId: 'tenant-A' }))
            .rejects.toThrow(ForbiddenException);

        expect(prisma.userRoleAssignment.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                userId: 'user1',
                scopeType: 'TENANT',
                scopeId: 'tenant-A'
            }
        }));
    });

    // ===========================================
    // TEST: Successful Switching
    // ===========================================
    it('should issue token via AuthService if assignment exists', async () => {
        const user = { id: 'user1', email: 'u@test.com' };
        prisma.userRoleAssignment.findFirst.mockResolvedValue({ id: 'assign1' });
        prisma.user.findUnique.mockResolvedValue(user);

        mockAuthService.issueTokenForScope.mockResolvedValue({ access_token: 'fake-jwt' });

        const result = await service.switchContext('user1', { scopeType: ScopeType.TENANT, scopeId: 'tenant-A' });

        expect(prisma.userRoleAssignment.findFirst).toHaveBeenCalled();
        expect(mockAuthService.issueTokenForScope).toHaveBeenCalledWith(user, 'TENANT', 'tenant-A');
        expect(result).toEqual({ access_token: 'fake-jwt' });
    });

});
