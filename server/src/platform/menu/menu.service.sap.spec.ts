/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP PARENT VISIBILITY LAW - UNIT TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP RULE: Parent visible = self.allowed OR ANY(child.visible)
 * 
 * These tests verify:
 * 1. Parent visibility when only child is allowed
 * 2. Order-independent visibility
 * 3. Real ADMIN_MENU_TREE with invoice-only permission
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { MenuService } from './menu.service';
import { ADMIN_MENU_TREE, MenuItem } from './menu.definition';

describe('SAP Parent Visibility Law - MenuService.filterMenu', () => {
    let menuService: MenuService;

    beforeEach(() => {
        menuService = new MenuService();
    });

    describe('Basic Parent-Child Visibility', () => {
        it('should show parent when ONLY child2 is allowed (not first child)', () => {
            // Arrange: Parent has permission, child1 denied, child2 allowed
            const menu: MenuItem[] = [{
                id: 'parent',
                label: 'Parent',
                permission: 'parent.read', // User does NOT have this
                children: [
                    { id: 'child1', label: 'Child 1', permission: 'child1.read' },
                    { id: 'child2', label: 'Child 2', permission: 'child2.read' }
                ]
            }];

            // User ONLY has child2 permission
            const permissions = ['child2.read'];

            // Act
            const result = menuService.filterMenu(menu, permissions);

            // Assert: Parent MUST be visible because child2 is visible
            expect(result.length).toBe(1);
            expect(result[0].id).toBe('parent');
            expect(result[0].children?.length).toBe(1);
            expect(result[0].children?.[0].id).toBe('child2');
        });

        it('should show parent when LAST child is allowed', () => {
            const menu: MenuItem[] = [{
                id: 'parent',
                label: 'Parent',
                children: [
                    { id: 'child1', label: 'Child 1', permission: 'child1.read' },
                    { id: 'child2', label: 'Child 2', permission: 'child2.read' },
                    { id: 'child3', label: 'Child 3', permission: 'child3.read' }
                ]
            }];

            // User ONLY has last child permission
            const permissions = ['child3.read'];

            const result = menuService.filterMenu(menu, permissions);

            expect(result.length).toBe(1);
            expect(result[0].children?.length).toBe(1);
            expect(result[0].children?.[0].id).toBe('child3');
        });

        it('should HIDE parent when NO children are allowed AND parent has unmet permission', () => {
            const menu: MenuItem[] = [{
                id: 'parent',
                label: 'Parent',
                permission: 'parent.read', // Parent requires this permission
                children: [
                    { id: 'child1', label: 'Child 1', permission: 'child1.read' },
                    { id: 'child2', label: 'Child 2', permission: 'child2.read' }
                ]
            }];

            // User has unrelated permission (no parent.read, no child permissions)
            const permissions = ['unrelated.read'];

            const result = menuService.filterMenu(menu, permissions);

            // Parent should NOT be visible (self=denied, no visible children)
            expect(result.length).toBe(0);
        });

        it('should show BOTH parent and child when parent has permission user has', () => {
            const menu: MenuItem[] = [{
                id: 'parent',
                label: 'Parent',
                permission: 'parent.read',
                children: [
                    { id: 'child1', label: 'Child 1', permission: 'child1.read' }
                ]
            }];

            // User has parent permission
            const permissions = ['parent.read'];

            const result = menuService.filterMenu(menu, permissions);

            // Parent visible (selfAllowed), but child hidden (no child1.read)
            expect(result.length).toBe(1);
            expect(result[0].id).toBe('parent');
            // Children should be empty (filtered out)
            expect(result[0].children).toBeUndefined();
        });
    });

    describe('Deep Nesting - Grandchild Visibility', () => {
        it('should show parent and child when only grandchild is allowed', () => {
            const menu: MenuItem[] = [{
                id: 'grandparent',
                label: 'Grandparent',
                children: [{
                    id: 'parent',
                    label: 'Parent',
                    children: [
                        { id: 'grandchild', label: 'Grandchild', permission: 'grandchild.read' }
                    ]
                }]
            }];

            const permissions = ['grandchild.read'];

            const result = menuService.filterMenu(menu, permissions);

            expect(result.length).toBe(1);
            expect(result[0].id).toBe('grandparent');
            expect(result[0].children?.length).toBe(1);
            expect(result[0].children?.[0].id).toBe('parent');
            expect(result[0].children?.[0].children?.length).toBe(1);
            expect(result[0].children?.[0].children?.[0].id).toBe('grandchild');
        });
    });

    describe('Real ADMIN_MENU_TREE - Invoice Only Permission', () => {
        it('should show settings > billing_config > invoice when only invoice.read is granted', () => {
            // User has ONLY billing invoice permission
            const permissions = ['system.settings.system_configurations.billing_configurations.invoice.read'];

            const result = menuService.filterMenu(ADMIN_MENU_TREE, permissions);

            // Find settings in result
            const settings = result.find(item => item.id === 'settings');
            expect(settings).toBeDefined();

            // Find system_config > billing_config
            const systemConfig = settings?.children?.find(c => c.id === 'system_config');
            expect(systemConfig).toBeDefined();

            const billingConfig = systemConfig?.children?.find(c => c.id === 'billing_config');
            expect(billingConfig).toBeDefined();

            // Invoice should be visible
            const invoice = billingConfig?.children?.find(c => c.id === 'invoice');
            expect(invoice).toBeDefined();
        });

        it('should NOT show unrelated sections with invoice-only permission', () => {
            const permissions = ['system.settings.system_configurations.billing_configurations.invoice.read'];

            const result = menuService.filterMenu(ADMIN_MENU_TREE, permissions);

            // Dashboard should NOT be visible (no dashboard.read)
            const dashboard = result.find(item => item.id === 'dashboard');
            expect(dashboard).toBeUndefined();

            // Tenants should NOT be visible
            const tenants = result.find(item => item.id === 'tenants');
            expect(tenants).toBeUndefined();
        });
    });

    describe('Order Independence', () => {
        it('should produce same result regardless of child order in permission list', () => {
            const menu: MenuItem[] = [{
                id: 'parent',
                label: 'Parent',
                children: [
                    { id: 'a', label: 'A', permission: 'a.read' },
                    { id: 'b', label: 'B', permission: 'b.read' },
                    { id: 'c', label: 'C', permission: 'c.read' }
                ]
            }];

            // Test with different permission orders
            const perms1 = ['a.read', 'c.read'];
            const perms2 = ['c.read', 'a.read'];

            const result1 = menuService.filterMenu(menu, perms1);
            const result2 = menuService.filterMenu(menu, perms2);

            // Both should produce same structure
            expect(result1[0].children?.length).toBe(2);
            expect(result2[0].children?.length).toBe(2);

            // Same IDs visible
            const ids1 = result1[0].children?.map(c => c.id).sort();
            const ids2 = result2[0].children?.map(c => c.id).sort();
            expect(ids1).toEqual(ids2);
        });
    });
});
