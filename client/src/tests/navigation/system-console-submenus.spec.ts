/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP ACCEPTANCE TEST: System Console (Non-First SubTab)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * perms = ["system.system_console.monitoring.logs.read"]
 * (logs is the 4th subTab under Monitoring, NOT first)
 * 
 * Assertions:
 * - getAllowedTabs includes 'monitoring'
 * - getAllowedSubTabs includes 'logs' (even though not first)
 * - First subTabs (dashboard, alerts, anomalies) NOT included
 * - evaluateRoute redirects to monitoring/logs target
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

const LOGS_ONLY_PERM = 'system.system_console.monitoring.logs.read';
const perms = [LOGS_ONLY_PERM];

describe('SAP Acceptance: System Console (Non-First SubTab)', () => {

    it('hasAnyVisibleTab returns true for admin.console', () => {
        const result = hasAnyVisibleTab('admin.console', perms, 'admin');
        expect(result).toBe(true);
    });

    it('getAllowedTabs includes monitoring', () => {
        const tabs = getAllowedTabs('admin.console', perms, 'admin');
        const hasMonitoring = tabs.some(t => t.key === 'monitoring');
        expect(hasMonitoring).toBe(true);
    });

    it('getAllowedSubTabs includes logs (4th subTab, not first)', () => {
        const subTabs = getAllowedSubTabs('admin.console', 'monitoring', perms, 'admin');
        const hasLogs = subTabs.some(st => st.key === 'logs');
        expect(hasLogs).toBe(true);
    });

    it('first subTabs (dashboard, alerts, anomalies) are NOT allowed', () => {
        const subTabs = getAllowedSubTabs('admin.console', 'monitoring', perms, 'admin');
        const hasDashboard = subTabs.some(st => st.key === 'dashboard');
        const hasAlerts = subTabs.some(st => st.key === 'alerts');
        const hasAnomalies = subTabs.some(st => st.key === 'anomalies');

        expect(hasDashboard).toBe(false);
        expect(hasAlerts).toBe(false);
        expect(hasAnomalies).toBe(false);
    });

    it('getFirstAllowedTarget returns monitoring/logs path', () => {
        const target = getFirstAllowedTarget('admin.console', perms, 'admin');
        expect(target).toContain('tab=monitoring');
        expect(target).toContain('subTab=logs');
    });

    it('evaluateRoute with missing tab redirects to monitoring/logs', () => {
        const searchParams = new URLSearchParams();
        const result = evaluateRoute('/admin/console', searchParams, perms, 'admin');

        expect(result.decision).toBe('REDIRECT');
        expect(result.normalizedUrl).toContain('tab=monitoring');
        expect(result.normalizedUrl).toContain('subTab=logs');
    });

    it('evaluateRoute with valid monitoring/logs allows access', () => {
        const searchParams = new URLSearchParams('tab=monitoring&subTab=logs');
        const result = evaluateRoute('/admin/console', searchParams, perms, 'admin');

        expect(result.decision).toBe('ALLOW');
    });

    it('ORDER-INDEPENDENCE: visibility does not depend on subTab position', () => {
        // logs is 4th subTab in registry order
        // visibility MUST work regardless of its position
        const visible = hasAnyVisibleTab('admin.console', perms, 'admin');
        const tabs = getAllowedTabs('admin.console', perms, 'admin');

        expect(visible).toBe(true);
        expect(tabs.length).toBeGreaterThan(0);
    });
});
