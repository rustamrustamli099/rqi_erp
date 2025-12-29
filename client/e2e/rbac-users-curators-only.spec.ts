/**
 * RBAC E2E Test: Curators-Only User
 * 
 * Scenario: User has ONLY system.users.curators.read permission
 * 
 * Expected:
 * - Sidebar: Users page visible
 * - UsersPage: ONLY Curators tab visible
 * - /admin/users opens to /admin/users?tab=curators
 * - /admin/users?tab=users rewrites to curators
 * - Users tab NOT in DOM
 */

import { test, expect } from '@playwright/test';

// Test user credentials (must have ONLY curators permission)
const CURATORS_ONLY_USER = {
    email: 'curators-only@test.com',
    password: 'TestPassword123!'
};

test.describe('RBAC: Curators-Only User', () => {

    test.beforeEach(async ({ page }) => {
        // Login as curators-only user
        await page.goto('/login');
        await page.fill('input[name="email"]', CURATORS_ONLY_USER.email);
        await page.fill('input[name="password"]', CURATORS_ONLY_USER.password);
        await page.click('button[type="submit"]');

        // Wait for redirect after login
        await page.waitForURL(/\/admin/);
    });

    test('sidebar shows Users page', async ({ page }) => {
        // Users menu item should be visible
        const usersMenuItem = page.locator('[data-testid="menu-users"], a[href*="/admin/users"]');
        await expect(usersMenuItem).toBeVisible();
    });

    test('navigating to /admin/users opens with ?tab=curators', async ({ page }) => {
        await page.goto('/admin/users');

        // Wait for URL rewrite
        await page.waitForURL(/tab=curators/);

        // URL should contain tab=curators
        expect(page.url()).toContain('tab=curators');
    });

    test('Users tab is NOT rendered in DOM', async ({ page }) => {
        await page.goto('/admin/users?tab=curators');

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Users tab should NOT exist in DOM
        const usersTab = page.locator('[data-tab="users"], button:has-text("Users"):not(:has-text("Curators"))');
        await expect(usersTab).toHaveCount(0);
    });

    test('Curators tab IS rendered and active', async ({ page }) => {
        await page.goto('/admin/users?tab=curators');

        await page.waitForLoadState('networkidle');

        // Curators tab should be visible
        const curatorsTab = page.locator('[data-tab="curators"], button:has-text("Curators")');
        await expect(curatorsTab.first()).toBeVisible();
    });

    test('typing ?tab=users in URL rewrites to curators', async ({ page }) => {
        // Try to access unauthorized tab via URL
        await page.goto('/admin/users?tab=users');

        // Should rewrite to curators (first allowed tab)
        await page.waitForURL(/tab=curators/);

        expect(page.url()).toContain('tab=curators');
        expect(page.url()).not.toContain('tab=users');
    });

    test('no redirect loops (max 3 navigations)', async ({ page }) => {
        let navigationCount = 0;

        page.on('framenavigated', () => {
            navigationCount++;
        });

        await page.goto('/admin/users');

        // Wait for stable state
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Should not exceed 3 navigations (initial + rewrite + possible one more)
        expect(navigationCount).toBeLessThanOrEqual(3);
    });

    test('other admin pages are hidden if no permission', async ({ page }) => {
        // Settings should not be visible (no permission)
        const settingsMenuItem = page.locator('[data-testid="menu-settings"], a[href*="/admin/settings"]');

        // Either not visible or not in DOM
        const count = await settingsMenuItem.count();
        if (count > 0) {
            await expect(settingsMenuItem).not.toBeVisible();
        }
    });
});
