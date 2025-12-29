/**
 * RBAC E2E Test: No Permissions - Terminal Access Denied
 * 
 * Scenario: User has NO permissions at all
 * 
 * Expected:
 * - After login, redirected to /access-denied
 * - AccessDenied is terminal (only logout allowed)
 * - Sidebar is empty or hidden
 * - No redirect loops
 */

import { test, expect } from '@playwright/test';

const NO_PERMISSIONS_USER = {
    email: 'no-permissions@test.com',
    password: 'TestPassword123!'
};

test.describe('RBAC: No Permissions - Terminal State', () => {

    test('login redirects to access-denied', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', NO_PERMISSIONS_USER.email);
        await page.fill('input[name="password"]', NO_PERMISSIONS_USER.password);
        await page.click('button[type="submit"]');

        // Should end up at access-denied
        await page.waitForURL(/access-denied/);
        expect(page.url()).toContain('access-denied');
    });

    test('access-denied page shows logout button', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', NO_PERMISSIONS_USER.email);
        await page.fill('input[name="password"]', NO_PERMISSIONS_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/access-denied/);

        // Logout button should be visible
        const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Çıxış")');
        await expect(logoutButton.first()).toBeVisible();
    });

    test('sidebar is hidden or empty on access-denied', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', NO_PERMISSIONS_USER.email);
        await page.fill('input[name="password"]', NO_PERMISSIONS_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/access-denied/);

        // Sidebar menu items should not exist
        const menuItems = page.locator('[data-testid^="menu-"]');
        await expect(menuItems).toHaveCount(0);
    });

    test('no redirect loops', async ({ page }) => {
        let navigationCount = 0;

        page.on('framenavigated', () => {
            navigationCount++;
        });

        await page.goto('/login');
        await page.fill('input[name="email"]', NO_PERMISSIONS_USER.email);
        await page.fill('input[name="password"]', NO_PERMISSIONS_USER.password);
        await page.click('button[type="submit"]');

        // Wait for stable state
        await page.waitForTimeout(3000);

        // Should not exceed 5 navigations total
        expect(navigationCount).toBeLessThanOrEqual(5);
    });

    test('direct URL to admin page redirects to access-denied', async ({ page }) => {
        // First login
        await page.goto('/login');
        await page.fill('input[name="email"]', NO_PERMISSIONS_USER.email);
        await page.fill('input[name="password"]', NO_PERMISSIONS_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/access-denied/);

        // Try to navigate to admin page directly
        await page.goto('/admin/users');

        // Should redirect back to access-denied
        await page.waitForURL(/access-denied/);
        expect(page.url()).toContain('access-denied');
    });
});
