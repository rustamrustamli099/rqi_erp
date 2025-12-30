/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP PARENT VISIBILITY LAW - UNIT TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Tests that parent menu/tab visibility follows SAP rule:
 * parent.visible = parent.allowed OR ANY(child.visible)
 * 
 * FORBIDDEN:
 * - First-child logic (children[0])
 * - Order-dependent visibility
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import { getAllowedTabs, getAllowedSubTabs, hasAnyPermission } from '@/app/security/navigationResolver';

describe('SAP Parent Visibility Law', () => {
    describe('hasAnyPermission', () => {
        it('should return true if ANY permission matches', () => {
            const userPerms = ['a.read', 'b.read'];
            const required = ['c.read', 'b.read'];
            expect(hasAnyPermission(userPerms, required)).toBe(true);
        });

        it('should return false if NO permission matches', () => {
            const userPerms = ['a.read', 'b.read'];
            const required = ['c.read', 'd.read'];
            expect(hasAnyPermission(userPerms, required)).toBe(false);
        });

        it('should return false for empty required array', () => {
            const userPerms = ['a.read'];
            expect(hasAnyPermission(userPerms, [])).toBe(false);
        });
    });

    describe('getAllowedTabs - Order-Independent Parent Visibility', () => {
        /**
         * CRITICAL TEST: First child denied, second child allowed → parent MUST be visible
         * This is the SAP law test.
         */
        it('should show parent if SECOND child is allowed (not first)', () => {
            // User has ONLY invoice permission (which is NOT first in subTabs)
            const userPerms = ['system.settings.system_configurations.billing_configurations.invoice.read'];

            const tabs = getAllowedTabs('admin.settings', userPerms, 'admin');
            const billingTab = tabs.find(t => t.key === 'billing_config');

            expect(billingTab).toBeDefined();
            expect(billingTab?.key).toBe('billing_config');
        });

        it('should show parent if LAST child is allowed', () => {
            // User has ONLY security permission (last in subTabs)
            const userPerms = ['system.settings.system_configurations.billing_configurations.security.read'];

            const tabs = getAllowedTabs('admin.settings', userPerms, 'admin');
            const billingTab = tabs.find(t => t.key === 'billing_config');

            expect(billingTab).toBeDefined();
        });

        it('should show parent if MIDDLE child is allowed', () => {
            // User has ONLY grace permission (middle in subTabs)
            const userPerms = ['system.settings.system_configurations.billing_configurations.grace.read'];

            const tabs = getAllowedTabs('admin.settings', userPerms, 'admin');
            const billingTab = tabs.find(t => t.key === 'billing_config');

            expect(billingTab).toBeDefined();
        });

        it('should hide parent if NO children allowed', () => {
            // User has unrelated permission
            const userPerms = ['system.unrelated.read'];

            const tabs = getAllowedTabs('admin.settings', userPerms, 'admin');
            const billingTab = tabs.find(t => t.key === 'billing_config');

            expect(billingTab).toBeUndefined();
        });

        // SAP-GRADE: Parent containers are PERMISSIONLESS.
        // Visibility comes ONLY from child permissions.
        // No test needed for parent.requiredAnyOf - it's always empty.
    });

    describe('getAllowedSubTabs - Order-Independent', () => {
        it('should return only allowed subTabs regardless of order', () => {
            // User has middle subTab permission
            const userPerms = ['system.settings.system_configurations.billing_configurations.invoice.read'];

            const subTabs = getAllowedSubTabs('admin.settings', 'billing_config', userPerms, 'admin');

            expect(subTabs.length).toBe(1);
            expect(subTabs[0].key).toBe('invoice');
        });

        it('should return multiple subTabs if multiple allowed', () => {
            const userPerms = [
                'system.settings.system_configurations.billing_configurations.pricing.read',
                'system.settings.system_configurations.billing_configurations.invoice.read'
            ];

            const subTabs = getAllowedSubTabs('admin.settings', 'billing_config', userPerms, 'admin');

            expect(subTabs.length).toBe(2);
            expect(subTabs.map(s => s.key)).toContain('pricing');
            expect(subTabs.map(s => s.key)).toContain('invoice');
        });
    });

    describe('Dictionaries - Order-Independent Parent Visibility', () => {
        it('should show dictionaries if ONLY currencies allowed', () => {
            const userPerms = ['system.settings.system_configurations.dictionary.currencies.read'];

            const tabs = getAllowedTabs('admin.settings', userPerms, 'admin');
            const dictTab = tabs.find(t => t.key === 'dictionaries');

            expect(dictTab).toBeDefined();
        });

        it('should show dictionaries if ONLY time_zones allowed', () => {
            const userPerms = ['system.settings.system_configurations.dictionary.time_zones.read'];

            const tabs = getAllowedTabs('admin.settings', userPerms, 'admin');
            const dictTab = tabs.find(t => t.key === 'dictionaries');

            expect(dictTab).toBeDefined();
        });
    });
});
