/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP REGRESSION TEST: System Console Monitoring SubTabs
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Verifies that resolveNavigationTree produces correct subTab children
 * for Monitoring tab, and ALL allowed subTabs are included (not just first).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import { resolveNavigationTree } from '@/app/security/navigationResolver';

describe('SAP Regression: System Console Monitoring SubTabs', () => {

    describe('Test A: Multiple allowed subTabs', () => {
        const perms = [
            'system.system_console.monitoring.system_logs.read',
            'system.system_console.monitoring.anomaly_detection.read'
        ];

        it('resolveNavigationTree includes console page', () => {
            const tree = resolveNavigationTree('admin', perms);
            const consolePage = tree.find(n => n.pageKey === 'admin.console');
            expect(consolePage).toBeDefined();
        });

        it('monitoring tab has ALL allowed subTabs (logs AND anomalies)', () => {
            const tree = resolveNavigationTree('admin', perms);
            const consolePage = tree.find(n => n.pageKey === 'admin.console');
            const monitoringTab = consolePage?.children?.find(t => t.tabKey === 'monitoring');

            expect(monitoringTab).toBeDefined();
            expect(monitoringTab?.children).toBeDefined();

            const subTabKeys = monitoringTab?.children?.map(st => st.subTabKey) ?? [];
            expect(subTabKeys).toContain('logs');
            expect(subTabKeys).toContain('anomalies');
        });

        it('subTabs order matches registry order (not permission order)', () => {
            const tree = resolveNavigationTree('admin', perms);
            const consolePage = tree.find(n => n.pageKey === 'admin.console');
            const monitoringTab = consolePage?.children?.find(t => t.tabKey === 'monitoring');

            const subTabKeys = monitoringTab?.children?.map(st => st.subTabKey) ?? [];

            // Registry order: dashboard, alerts, anomalies, logs
            // Only anomalies and logs are allowed
            const anomaliesIndex = subTabKeys.indexOf('anomalies');
            const logsIndex = subTabKeys.indexOf('logs');

            // anomalies should come before logs (registry order)
            expect(anomaliesIndex).toBeLessThan(logsIndex);
        });
    });

    describe('Test B: Non-first subTab only', () => {
        const perms = ['system.system_console.monitoring.anomaly_detection.read'];

        it('anomalies subTab is included even though not first in registry', () => {
            const tree = resolveNavigationTree('admin', perms);
            const consolePage = tree.find(n => n.pageKey === 'admin.console');
            const monitoringTab = consolePage?.children?.find(t => t.tabKey === 'monitoring');

            expect(monitoringTab).toBeDefined();
            expect(monitoringTab?.children).toBeDefined();

            const subTabKeys = monitoringTab?.children?.map(st => st.subTabKey) ?? [];
            expect(subTabKeys).toEqual(['anomalies']);
        });

        it('first subTabs (dashboard, alerts) are NOT included', () => {
            const tree = resolveNavigationTree('admin', perms);
            const consolePage = tree.find(n => n.pageKey === 'admin.console');
            const monitoringTab = consolePage?.children?.find(t => t.tabKey === 'monitoring');

            const subTabKeys = monitoringTab?.children?.map(st => st.subTabKey) ?? [];
            expect(subTabKeys).not.toContain('dashboard');
            expect(subTabKeys).not.toContain('alerts');
        });
    });

    describe('Test C: All four subTabs allowed', () => {
        const perms = [
            'system.system_console.monitoring.dashboard.read',
            'system.system_console.monitoring.alert_rules.read',
            'system.system_console.monitoring.anomaly_detection.read',
            'system.system_console.monitoring.system_logs.read'
        ];

        it('all four subTabs are included', () => {
            const tree = resolveNavigationTree('admin', perms);
            const consolePage = tree.find(n => n.pageKey === 'admin.console');
            const monitoringTab = consolePage?.children?.find(t => t.tabKey === 'monitoring');

            const subTabKeys = monitoringTab?.children?.map(st => st.subTabKey) ?? [];
            expect(subTabKeys).toHaveLength(4);
            expect(subTabKeys).toContain('dashboard');
            expect(subTabKeys).toContain('alerts');
            expect(subTabKeys).toContain('anomalies');
            expect(subTabKeys).toContain('logs');
        });
    });
});
