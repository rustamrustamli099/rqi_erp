/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP ACCEPTANCE TEST: Settings → Billing Config (Invoice-Only)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * perms = ["system.settings.system_configurations.billing_configurations.invoice.read"]
 * 
 * Assertions:
 * - hasAnyVisibleTab('admin.settings', perms, 'admin') === true
 * - getAllowedTabs includes 'billing_config'
 * - getAllowedSubTabs returns ONLY ['invoice']
 * - evaluateRoute redirects to ?tab=billing_config&subTab=invoice
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import {
    hasAnyVisibleTab,
    getAllowedTabs,
    getAllowedSubTabs,
    getFirstAllowedTarget,
    evaluateRoute
} from '@/app/security/navigationResolver';

const INVOICE_ONLY_PERM = 'system.settings.system_configurations.billing_configurations.invoice.read';
const perms = [INVOICE_ONLY_PERM];

describe('SAP Acceptance: Settings → Billing Config (Invoice-Only)', () => {

    it('hasAnyVisibleTab returns true for admin.settings', () => {
        const result = hasAnyVisibleTab('admin.settings', perms, 'admin');
        expect(result).toBe(true);
    });

    it('getAllowedTabs includes billing_config', () => {
        const tabs = getAllowedTabs('admin.settings', perms, 'admin');
        const hasBillingConfig = tabs.some(t => t.key === 'billing_config');
        expect(hasBillingConfig).toBe(true);
    });

    it('getAllowedSubTabs returns ONLY invoice', () => {
        const subTabs = getAllowedSubTabs('admin.settings', 'billing_config', perms, 'admin');
        expect(subTabs.length).toBe(1);
        expect(subTabs[0].key).toBe('invoice');
    });

    it('getFirstAllowedTarget returns correct path', () => {
        const target = getFirstAllowedTarget('admin.settings', perms, 'admin');
        expect(target).toBe('/admin/settings?tab=billing_config&subTab=invoice');
    });

    it('evaluateRoute with missing tab redirects to billing_config/invoice', () => {
        const searchParams = new URLSearchParams();
        const result = evaluateRoute('/admin/settings', searchParams, perms, 'admin');

        expect(result.decision).toBe('REDIRECT');
        expect(result.normalizedUrl).toContain('tab=billing_config');
        expect(result.normalizedUrl).toContain('subTab=invoice');
    });

    it('evaluateRoute with invalid tab redirects to billing_config/invoice', () => {
        const searchParams = new URLSearchParams('tab=general'); // No permission for general
        const result = evaluateRoute('/admin/settings', searchParams, perms, 'admin');

        expect(result.decision).toBe('REDIRECT');
        expect(result.normalizedUrl).toContain('tab=billing_config');
    });

    it('evaluateRoute with valid tab/subTab allows access', () => {
        const searchParams = new URLSearchParams('tab=billing_config&subTab=invoice');
        const result = evaluateRoute('/admin/settings', searchParams, perms, 'admin');

        expect(result.decision).toBe('ALLOW');
    });
});
