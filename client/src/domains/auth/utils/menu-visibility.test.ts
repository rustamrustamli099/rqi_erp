import { MenuVisibilityEngine } from './menu-visibility';
import type { AdminMenuItem } from '@/app/navigation/menu.definitions';

const MOCK_MENU: AdminMenuItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        route: '/dashboard',
        requiredPermissions: ['dashboard.view']
    },
    {
        id: 'settings',
        label: 'Settings',
        route: '/settings',
        requiredPermissions: ['settings.view'], // Direct permission
        children: [
            {
                id: 'settings.general',
                label: 'General',
                route: '/settings/general',
                requiredPermissions: ['settings.general.view']
            },
            {
                id: 'settings.security',
                label: 'Security',
                route: '/settings/security',
                requiredPermissions: ['settings.security.view']
            }
        ]
    }
];

describe('MenuVisibilityEngine', () => {

    test('Should show public items (no permissions required)', () => {
        const menu: AdminMenuItem[] = [{ id: 'public', label: 'Public', route: '/' }];
        const result = MenuVisibilityEngine.computeVisibleTree(menu, () => false);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('public');
    });

    test('Should hide items if user lacks direct permission', () => {
        const result = MenuVisibilityEngine.computeVisibleTree(MOCK_MENU, (perms) => false);
        expect(result).toHaveLength(0);
    });

    test('Should show item if user has direct permission', () => {
        const result = MenuVisibilityEngine.computeVisibleTree(MOCK_MENU, (perms) => perms.includes('dashboard.view'));
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('dashboard');
    });

    test('Inference: Parent should be visible if Child is visible (even without parent perm)', () => {
        // User has 'settings.security.view' BUT NOT 'settings.view'
        const hasAny = (perms: string[]) => perms.includes('settings.security.view');

        const result = MenuVisibilityEngine.computeVisibleTree(MOCK_MENU, hasAny);

        // Settings should be visible
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('settings');

        // Only Security child should be visible
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children![0].id).toBe('settings.security');

        // Path Rewrite Check
        // Since user has no direct settings.view, path might be rewritten to first child
        expect(result[0].route).toBe('/settings/security');
    });

    test('Direct Permission Preserves Path', () => {
        // User has both Parent and Child permission
        const hasAny = (perms: string[]) => ['settings.view', 'settings.security.view'].some(p => perms.includes(p));

        const result = MenuVisibilityEngine.computeVisibleTree(MOCK_MENU, hasAny);

        expect(result[0].id).toBe('settings');
        expect(result[0].route).toBe('/settings'); // Keeps original path
    });
});

