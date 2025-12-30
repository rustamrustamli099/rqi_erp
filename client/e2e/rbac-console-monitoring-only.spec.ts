/**
 * RBAC E2E Test: Console Monitoring-Only User
 * 
 * SAP-GRADE: Tests resolver-driven allowlist for Monitoring subTabs
 * 
 * Scenario: User has ONLY system.system_console.monitoring.dashboard.read
 * 
 * Expected:
 * - Only Dashboard subTab trigger renders (not in DOM: alerts, anomalies, logs)
 * - URL subTab clamped to dashboard if unauthorized param passed
 * - No /access-denied flash during redirect
 */

import { test, expect } from '@playwright/test';

const MONITORING_ONLY_USER = {
    email: 'monitoring-only@test.com',
    password: 'TestPassword123!'
};

test.describe('RBAC: Console Monitoring-Only User', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', MONITORING_ONLY_USER.email);
        await page.fill('input[name="password"]', MONITORING_ONLY_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/admin/);
    });

    test('sidebar shows System Console page', async ({ page }) => {
        const consoleMenuItem = page.locator('[data-testid="menu-console"], a[href*="/admin/console"]');
        await expect(consoleMenuItem).toBeVisible();
    });

    test('console opens to monitoring tab with dashboard subTab', async ({ page }) => {
        await page.goto('/admin/console');
        await page.waitForURL(/tab=monitoring/);
        expect(page.url()).toContain('tab=monitoring');
        expect(page.url()).toContain('subTab=dashboard');
    });

    test('SAP: only dashboard subTab trigger is in DOM', async ({ page }) => {
        await page.goto('/admin/console?tab=monitoring&subTab=dashboard');
        await page.waitForLoadState('networkidle');

        // Dashboard subTab MUST be visible
        const dashboardSubTab = page.locator('[data-subtab="dashboard"]');
        await expect(dashboardSubTab).toBeVisible();

        // SAP-GRADE: All unauthorized subTabs must NOT be in DOM (not just hidden)
        const alertsSubTab = page.locator('[data-subtab="alerts"]');
        await expect(alertsSubTab).toHaveCount(0);

        const anomaliesSubTab = page.locator('[data-subtab="anomalies"]');
        await expect(anomaliesSubTab).toHaveCount(0);

        const logsSubTab = page.locator('[data-subtab="logs"]');
        await expect(logsSubTab).toHaveCount(0);
    });

    test('SAP: unauthorized subTab URL redirects to dashboard (NO /access-denied)', async ({ page }) => {
        const navigations: string[] = [];
        page.on('framenavigated', (frame) => {
            if (frame === page.mainFrame()) {
                navigations.push(frame.url());
            }
        });

        // Try to access unauthorized alerts subTab
        await page.goto('/admin/console?tab=monitoring&subTab=alerts');
        await page.waitForLoadState('networkidle');

        // Should clamp to dashboard
        await expect(page).toHaveURL(/subTab=dashboard/);

        // Should NOT have visited /access-denied
        const visitedAccessDenied = navigations.some(url => url.includes('access-denied'));
        expect(visitedAccessDenied).toBe(false);
    });

    test('SAP: unauthorized anomalies subTab redirects without flicker', async ({ page }) => {
        await page.goto('/admin/console?tab=monitoring&subTab=anomalies');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/subTab=dashboard/);
        await expect(page).not.toHaveURL(/access-denied/);
    });

    test('SAP: unauthorized logs subTab redirects without flicker', async ({ page }) => {
        await page.goto('/admin/console?tab=monitoring&subTab=logs');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/subTab=dashboard/);
        await expect(page).not.toHaveURL(/access-denied/);
    });

    test('other console tabs are NOT in DOM', async ({ page }) => {
        await page.goto('/admin/console?tab=monitoring&subTab=dashboard');
        await page.waitForLoadState('networkidle');

        // Audit tab should not be visible (no permission)
        const auditTab = page.locator('[data-tab="audit"]');
        await expect(auditTab).toHaveCount(0);

        // Jobs tab should not be visible
        const jobsTab = page.locator('[data-tab="jobs"]');
        await expect(jobsTab).toHaveCount(0);
    });
});
