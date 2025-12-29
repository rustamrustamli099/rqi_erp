/**
 * RBAC E2E Test: Console Monitoring-Only User
 * 
 * Scenario: User has ONLY system.system_console.monitoring.dashboard.read
 * 
 * Expected:
 * - Sidebar: System Console page visible
 * - Console opens to monitoring dashboard subTab
 * - No other monitoring subTabs render
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

    test('console opens to monitoring tab', async ({ page }) => {
        await page.goto('/admin/console');
        await page.waitForURL(/tab=monitoring/);
        expect(page.url()).toContain('tab=monitoring');
    });

    test('only dashboard subTab is visible', async ({ page }) => {
        await page.goto('/admin/console?tab=monitoring&subTab=dashboard');
        await page.waitForLoadState('networkidle');

        // Dashboard subTab should be visible
        const dashboardSubTab = page.locator('[data-subtab="dashboard"], button:has-text("Dashboard")');
        await expect(dashboardSubTab.first()).toBeVisible();

        // Other subTabs should NOT be in DOM
        const alertRulesSubTab = page.locator('[data-subtab="alert_rules"]');
        await expect(alertRulesSubTab).toHaveCount(0);
    });

    test('other console tabs are hidden', async ({ page }) => {
        await page.goto('/admin/console?tab=monitoring&subTab=dashboard');
        await page.waitForLoadState('networkidle');

        // Audit tab should not be visible
        const auditTab = page.locator('[data-tab="audit"]');
        await expect(auditTab).toHaveCount(0);
    });
});
