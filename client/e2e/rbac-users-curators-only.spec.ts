/**
 * SAP-Grade E2E Test: Curators-Only User (FAIL-CLOSED)
 * 
 * Tests terminal 403 behavior for unauthorized tabs
 * /admin/users?tab=users → 403 terminal (NO redirect)
 */

import { test, expect } from '@playwright/test';

const CURATORS_ONLY_USER = {
    email: 'curators-only@test.com',
    password: 'TestPassword123!'
};

test.describe('RBAC: Curators-Only User - Fail Closed', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', CURATORS_ONLY_USER.email);
        await page.fill('input[name="password"]', CURATORS_ONLY_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/admin/, { timeout: 10000 });
    });

    test('sidebar shows Users page', async ({ page }) => {
        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');

        const usersMenu = page.locator('[data-testid="menu-users"]');
        await expect(usersMenu).toBeVisible();
    });

    test('navigating to /admin/users opens with ?tab=curators', async ({ page }) => {
        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/tab=curators/);
    });

    test('Users tab is NOT rendered in DOM', async ({ page }) => {
        await page.goto('/admin/users?tab=curators');
        await page.waitForLoadState('networkidle');

        const usersTab = page.locator('[data-value="users"], [data-tab="users"]');
        await expect(usersTab).toHaveCount(0);
    });

    test('Curators tab IS rendered and active', async ({ page }) => {
        await page.goto('/admin/users?tab=curators');
        await page.waitForLoadState('networkidle');

        const curatorsTab = page.locator('[data-value="curators"], [data-tab="curators"]');
        await expect(curatorsTab.first()).toBeVisible();
    });

    // FAIL-CLOSED: Terminal 403 test
    test('typing ?tab=users shows terminal 403', async ({ page }) => {
        await page.goto('/admin/users?tab=users');
        await page.waitForLoadState('networkidle');

        // FAIL-CLOSED: Should show access-denied
        await expect(page).toHaveURL(/access-denied/);

        // Should stay on 403 page
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/access-denied/);
    });

    test('no redirect loops (max 3 navigations)', async ({ page }) => {
        let navigationCount = 0;

        page.on('framenavigated', () => {
            navigationCount++;
        });

        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        expect(navigationCount).toBeLessThanOrEqual(3);
    });

    test('other admin pages are hidden if no permission', async ({ page }) => {
        await page.goto('/admin/users?tab=curators');
        await page.waitForLoadState('networkidle');

        const settingsMenu = page.locator('[data-testid="menu-settings"]');
        await expect(settingsMenu).toHaveCount(0);
    });
});
