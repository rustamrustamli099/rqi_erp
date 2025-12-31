import { Test, TestingModule } from '@nestjs/testing';
import { DecisionOrchestrator } from './decision.orchestrator';
import { DecisionCenterService } from './decision-center.service';
import { EffectivePermissionsService } from '../auth/effective-permissions.service';
import { MenuItem } from '../menu/menu.definition';

describe('Decision Architecture', () => {
    let orchestrator: DecisionOrchestrator;
    let decisionCenter: DecisionCenterService;
    let effectivePermissionsService: EffectivePermissionsService;

    const MOCK_TREE: MenuItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            path: '/dashboard',
            permission: 'system.dashboard.read'
        },
        {
            id: 'settings',
            label: 'Settings', // Container
            children: [
                {
                    id: 'users',
                    label: 'Users',
                    path: '/settings/users',
                    permission: 'system.settings.users.read'
                },
                {
                    id: 'billing',
                    label: 'Billing',
                    path: '/settings/billing',
                    permission: 'system.settings.billing.read'
                }
            ]
        }
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DecisionOrchestrator,
                DecisionCenterService,
                {
                    provide: EffectivePermissionsService,
                    useValue: {
                        computeEffectivePermissions: jest.fn()
                    }
                }
            ],
        }).compile();

        orchestrator = module.get<DecisionOrchestrator>(DecisionOrchestrator);
        decisionCenter = module.get<DecisionCenterService>(DecisionCenterService);
        effectivePermissionsService = module.get<EffectivePermissionsService>(EffectivePermissionsService);
    });

    describe('DecisionCenterService (Pure Logic)', () => {
        it('should hide items if permission is missing', () => {
            const permissions = []; // No permissions
            const result = decisionCenter.resolveNavigationTree(MOCK_TREE, permissions);
            expect(result).toHaveLength(0);
        });

        it('should show item if permission exists', () => {
            const permissions = ['system.dashboard.read'];
            const result = decisionCenter.resolveNavigationTree(MOCK_TREE, permissions);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('dashboard');
        });

        it('should auto-hide empty containers (SAP Rule)', () => {
            const permissions = ['system.dashboard.read'];
            // User has NO permissions for Settings children
            const result = decisionCenter.resolveNavigationTree(MOCK_TREE, permissions);

            // Should see Dashboard, but NOT Settings
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('dashboard');
        });

        it('should show container if AT LEAST ONE child is visible (SAP Rule)', () => {
            const permissions = ['system.settings.users.read'];
            const result = decisionCenter.resolveNavigationTree(MOCK_TREE, permissions);

            // Should see Settings (Container) -> Users
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('settings');
            expect(result[0].children).toHaveLength(1);
            expect(result[0].children![0].id).toBe('users');
        });

        it('should evaluate routes correctly', () => {
            const permissions = ['system.settings.users.read'];

            expect(decisionCenter.evaluateRoute(MOCK_TREE, permissions, '/settings/users')).toBe(true);
            expect(decisionCenter.evaluateRoute(MOCK_TREE, permissions, '/settings/billing')).toBe(false); // No permission
            expect(decisionCenter.evaluateRoute(MOCK_TREE, permissions, '/dashboard')).toBe(false); // No permission
        });
    });

    describe('DecisionOrchestrator (Integration)', () => {
        it('should orchestrate flow: Context -> Permissions -> Decision', async () => {
            const mockUser = { userId: 'u1', scopeType: 'SYSTEM', scopeId: null };
            const mockPermissions = ['system.dashboard.read'];

            (effectivePermissionsService.computeEffectivePermissions as jest.Mock).mockResolvedValue(mockPermissions);

            // Spy on Decision Center
            const spyResolve = jest.spyOn(decisionCenter, 'resolveNavigationTree');

            const result = await orchestrator.getNavigationForUser(mockUser);

            // Verify Flow
            expect(effectivePermissionsService.computeEffectivePermissions).toHaveBeenCalledWith({
                userId: 'u1', scopeType: 'SYSTEM', scopeId: null
            });
            expect(spyResolve).toHaveBeenCalledWith(expect.any(Array), mockPermissions);

            // Verify Result
            expect(result.find(x => x.id === 'dashboard')).toBeDefined();
        });
    });
});
