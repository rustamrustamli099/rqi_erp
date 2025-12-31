/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP VISIBILITY LAW — PROOF TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Tests proving:
 * 1) Invoice-only shows Settings + Billing + routes correctly
 * 2) Non-first subTab (logs) shows Monitoring when only it's permitted
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import {
    canAccessPage,
    getFirstAllowedTab
} from '@/app/navigation/tabSubTab.registry';
import {
    hasAnyVisibleTab,
    getFirstAllowedTarget,
    getAllowedTabs,
    getAllowedSubTabs
} from '@/app/security/navigationResolver';

describe('SAP Target 1: Invoice-Only Permission', () => {
    const INVOICE_ONLY_PERM = 'system.settings.system_configurations.billing_configurations.invoice.read';
    const perms = [INVOICE_ONLY_PERM];

    it('Settings page is accessible with invoice-only permission', () => {
        const canAccess = canAccessPage('admin.settings', perms, 'admin');
        expect(canAccess).toBe(true);
    });

    it('hasAnyVisibleTab returns true for settings with invoice-only', () => {
        const hasVisible = hasAnyVisibleTab('admin.settings', perms, 'admin');
        expect(hasVisible).toBe(true);
    });

    it('billing_config tab is in allowed tabs list', () => {
        const allowedTabs = getAllowedTabs('admin.settings', perms, 'admin');
        const hasBillingConfig = allowedTabs.some(t => t.key === 'billing_config');
        expect(hasBillingConfig).toBe(true);
    });

    it('invoice subTab is in allowed subTabs list', () => {
        const allowedSubTabs = getAllowedSubTabs('admin.settings', 'billing_config', perms, 'admin');
        const hasInvoice = allowedSubTabs.some(st => st.key === 'invoice');
        expect(hasInvoice).toBe(true);
    });

    it('only invoice subTab is allowed (no other billing subTabs)', () => {
        const allowedSubTabs = getAllowedSubTabs('admin.settings', 'billing_config', perms, 'admin');
        expect(allowedSubTabs.length).toBe(1);
        expect(allowedSubTabs[0].key).toBe('invoice');
    });

    it('getFirstAllowedTab returns billing_config with invoice subTab', () => {
        const result = getFirstAllowedTab('admin.settings', perms, 'admin');
        expect(result).toEqual({ tab: 'billing_config', subTab: 'invoice' });
    });

    it('getFirstAllowedTarget routes to /admin/settings?tab=billing_config&subTab=invoice', () => {
        const route = getFirstAllowedTarget('admin.settings', perms, 'admin');
        expect(route).toBe('/admin/settings?tab=billing_config&subTab=invoice');
    });
});

describe('SAP Target 2: Non-First SubTab (System Console Logs)', () => {
    // 'logs' is the 4th subTab under Monitoring, not first
    const LOGS_ONLY_PERM = 'system.system_console.monitoring.logs.read';
    const perms = [LOGS_ONLY_PERM];

    it('System Console page is accessible with logs-only permission', () => {
        const canAccess = canAccessPage('admin.console', perms, 'admin');
        expect(canAccess).toBe(true);
    });

    it('hasAnyVisibleTab returns true for console with logs-only', () => {
        const hasVisible = hasAnyVisibleTab('admin.console', perms, 'admin');
        expect(hasVisible).toBe(true);
    });

    it('monitoring tab is in allowed tabs list', () => {
        const allowedTabs = getAllowedTabs('admin.console', perms, 'admin');
        const hasMonitoring = allowedTabs.some(t => t.key === 'monitoring');
        expect(hasMonitoring).toBe(true);
    });

    it('logs subTab is in allowed subTabs list', () => {
        const allowedSubTabs = getAllowedSubTabs('admin.console', 'monitoring', perms, 'admin');
        const hasLogs = allowedSubTabs.some(st => st.key === 'logs');
        expect(hasLogs).toBe(true);
    });

    it('first subTabs (dashboard, alerts, anomalies) are NOT allowed', () => {
        const allowedSubTabs = getAllowedSubTabs('admin.console', 'monitoring', perms, 'admin');
        const hasDashboard = allowedSubTabs.some(st => st.key === 'dashboard');
        const hasAlerts = allowedSubTabs.some(st => st.key === 'alerts');
        const hasAnomalies = allowedSubTabs.some(st => st.key === 'anomalies');

        expect(hasDashboard).toBe(false);
        expect(hasAlerts).toBe(false);
        expect(hasAnomalies).toBe(false);
    });

    it('getFirstAllowedTab returns monitoring with logs subTab', () => {
        const result = getFirstAllowedTab('admin.console', perms, 'admin');
        expect(result).toEqual({ tab: 'monitoring', subTab: 'logs' });
    });

    it('visibility is ORDER-INDEPENDENT: logs works regardless of position', () => {
        // This test proves that the 4th subTab (logs) makes parent visible
        // without requiring first 3 subTabs to be allowed
        const canAccess = canAccessPage('admin.console', perms, 'admin');
        const allowedTabs = getAllowedTabs('admin.console', perms, 'admin');

        expect(canAccess).toBe(true);
        expect(allowedTabs.length).toBeGreaterThan(0);
    });
});

describe('SAP Law: Permissionless Parent Containers', () => {
    it('billing_config (permissionless parent) becomes visible when child is allowed', () => {
        const perms = ['system.settings.system_configurations.billing_configurations.pricing.read'];
        const allowedTabs = getAllowedTabs('admin.settings', perms, 'admin');
        const hasBillingConfig = allowedTabs.some(t => t.key === 'billing_config');

        expect(hasBillingConfig).toBe(true);
    });

    it('monitoring (permissionless parent) becomes visible when child is allowed', () => {
        const perms = ['system.system_console.monitoring.anomalies.read'];
        const allowedTabs = getAllowedTabs('admin.console', perms, 'admin');
        const hasMonitoring = allowedTabs.some(t => t.key === 'monitoring');

        expect(hasMonitoring).toBe(true);
    });

    it('dictionaries (permissionless parent) becomes visible when child is allowed', () => {
        const perms = ['system.settings.system_configurations.dictionary.currencies.read'];
        const allowedTabs = getAllowedTabs('admin.settings', perms, 'admin');
        const hasDictionaries = allowedTabs.some(t => t.key === 'dictionaries');

        expect(hasDictionaries).toBe(true);
    });
});
