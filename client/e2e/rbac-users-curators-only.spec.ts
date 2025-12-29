/**
 * SAP-Grade E2E Test: Curators-Only User
 * 
 * Tests terminal 403 behavior for unauthorized tabs
 * /admin/users?tab=users MUST show 403 (NOT rewrite to curators)
 */

import { test, expect } from '@playwright/test';

const CURATORS_ONLY_USER = {
    email: 'curators-only@test.com',
    password: 'TestPassword123!'
};

test.describe('RBAC: Curators-Only User - Terminal 403', () => {

    test.beforeEach(async ({ page }) => {
        // Login as curators-only user
        await page.goto('/login');
        await page.fill('input[name="email"]', CURATORS_ONLY_USER.email);
        await page.fill('input[name="password"]', CURATORS_ONLY_USER.password);
        await page.click('button[type="submit"]');

        // Wait for redirect to admin area
        await page.waitForURL(/\/admin/, { timeout: 10000 });
    });

    test('sidebar shows Users page', async ({ page }) => {
        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');

        // Users menu should be visible
        const usersMenu = page.locator('[data-testid="menu-users"]');
        await expect(usersMenu).toBeVisible();
    });

    test('navigating to /admin/users opens with ?tab=curators', async ({ page }) => {
        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');

        // Should redirect to curators tab (only allowed tab)
        await expect(page).toHaveURL(/tab=curators/);
    });

    test('Users tab is NOT rendered in DOM', async ({ page }) => {
        await page.goto('/admin/users?tab=curators');
        await page.waitForLoadState('networkidle');

        // Users tab should NOT exist in DOM
        const usersTab = page.locator('[data-value="users"], [data-tab="users"]');
        await expect(usersTab).toHaveCount(0);
    });

    test('Curators tab IS rendered and active', async ({ page }) => {
        await page.goto('/admin/users?tab=curators');
        await page.waitForLoadState('networkidle');

        // Curators tab should be visible
        const curatorsTab = page.locator('[data-value="curators"], [data-tab="curators"]');
        await expect(curatorsTab.first()).toBeVisible();
    });

    // SAP-GRADE: Terminal 403 test
    test('typing ?tab=users in URL shows 403 (NOT rewrite)', async ({ page }) => {
        await page.goto('/admin/users?tab=users');
        await page.waitForLoadState('networkidle');

        // SAP-GRADE: Should show access-denied, NOT rewrite to curators
        await expect(page).toHaveURL(/access-denied/);

        // Should see "Səlahiyyətiniz yoxdur" or similar message
        const accessDeniedText = page.getByText(/access|denied|səlahiyyət/i);
        await expect(accessDeniedText.first()).toBeVisible();
    });

    test('no redirect loops (max 3 navigations)', async ({ page }) => {
        let navigationCount = 0;

        page.on('framenavigated', () => {
            navigationCount++;
        });

        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');

        // Wait a bit for any potential loops
        await page.waitForTimeout(2000);

        // Should not have more than 3 navigations
        expect(navigationCount).toBeLessThanOrEqual(3);
    });

    test('other admin pages are hidden if no permission', async ({ page }) => {
        await page.goto('/admin/users?tab=curators');
        await page.waitForLoadState('networkidle');

        // Settings should NOT be visible (no permission)
        const settingsMenu = page.locator('[data-testid="menu-settings"]');
        await expect(settingsMenu).toHaveCount(0);
    });
});
