/**
 * E2E Test Suite - ULTRA MODE Core Flows
 * SAP-Grade RBAC + Approvals + Workflow Demonstration
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

test.describe('ULTRA MODE E2E Demonstration', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to login
        await page.goto(BASE_URL);
    });

    test('1. Login Flow - Admin Panel Access', async ({ page }) => {
        // Fill login form
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', ADMIN_PASSWORD);
        await page.click('button[type="submit"]');

        // Should redirect to admin dashboard
        await expect(page).toHaveURL(/.*admin/);

        // Sidebar should be visible
        await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    });

    test('2. RBAC Menu Visibility - Tab-Based Navigation', async ({ page }) => {
        await login(page);

        // Navigate to Settings
        await page.click('text=Parametrlər');
        await expect(page).toHaveURL(/.*settings/);

        // Tabs should be visible
        await expect(page.locator('[role="tablist"]')).toBeVisible();

        // Navigate to Roles tab
        await page.click('text=Rollar');
        await expect(page).toHaveURL(/.*tab=roles/);
    });

    test('3. Role Editor - Permission Preview Integration', async ({ page }) => {
        await login(page);
        await page.goto(`${BASE_URL}/admin/settings?tab=roles`);

        // Click on a role row to edit
        await page.click('table tbody tr:first-child');

        // Wait for drawer to open
        await expect(page.locator('[data-testid="role-drawer"]')).toBeVisible();

        // Navigate to preview tab
        await page.click('text=Simulyasiya');

        // Permission preview should show
        await expect(page.locator('text=Menu Preview')).toBeVisible();
        await expect(page.locator('text=Simulyasiya Nəticəsi')).toBeVisible();
    });

    test('4. Approval Flow - Role Change Request', async ({ page }) => {
        await login(page);
        await page.goto(`${BASE_URL}/admin/settings?tab=roles`);

        // Open role editor
        await page.click('table tbody tr:first-child');

        // Make a change (toggle a permission)
        await page.click('text=platform.users.read');

        // Save should trigger approval
        await page.click('button:has-text("Yadda Saxla")');

        // Confirmation should appear
        await expect(page.locator('text=Təsdiq')).toBeVisible();

        // Navigate to Approvals
        await page.click('text=Təsdiqləmələr');
        await expect(page).toHaveURL(/.*approvals/);

        // Should see pending approval
        await expect(page.locator('table tbody tr')).toHaveCount.greaterThan(0);
    });

    test('5. SoD Conflict Detection', async ({ page }) => {
        await login(page);
        await page.goto(`${BASE_URL}/admin/settings?tab=roles`);

        // Open role editor
        await page.click('table tbody tr:first-child');

        // Select conflicting permissions
        await page.click('text=platform.approvals.approve');
        await page.click('text=platform.approvals.reject');

        // Should show SoD warning
        await expect(page.locator('text=Səlahiyyət Ayrılığı Konflikti')).toBeVisible();
    });

    test('6. Notification Bell - Unread Count', async ({ page }) => {
        await login(page);

        // Notification bell should be in header
        const bell = page.locator('[data-testid="notification-bell"]');
        await expect(bell).toBeVisible();

        // Click to open dropdown
        await bell.click();
        await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
    });

    test('7. Export to Excel - High Risk Warning', async ({ page }) => {
        await login(page);
        await page.goto(`${BASE_URL}/admin/settings?tab=roles`);

        // Click export button
        await page.click('button:has-text("Excel")');

        // Export modal should open
        await expect(page.locator('text=Export')).toBeVisible();

        // High risk warning should be visible for ROLES
        await expect(page.locator('text=Yüksək riskli')).toBeVisible();
    });

    test('8. Access Denied - Zero Permissions', async ({ page }) => {
        // Login with a user that has no permissions
        await page.fill('input[name="email"]', 'noperm@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Should redirect to access-denied
        await expect(page).toHaveURL(/.*access-denied/);

        // Only logout button should be visible
        await expect(page.locator('button:has-text("Çıxış")')).toBeVisible();
    });

});

// Helper function
async function login(page: Page) {
    await page.goto(BASE_URL);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*admin/);
}
