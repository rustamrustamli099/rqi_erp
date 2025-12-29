/**
 * SAP-Grade E2E Test: Settings Dictionaries Currency-Only (FAIL-CLOSED)
 * 
 * Tests terminal 403 for unauthorized tabs/subtabs
 * /admin/settings?tab=smtp → 403 terminal
 */

import { test, expect } from '@playwright/test';

const DICTIONARIES_ONLY_USER = {
    email: 'dictionaries-currency@test.com',
    password: 'TestPassword123!'
};

test.describe('RBAC: Settings Dictionaries Currency-Only - Fail Closed', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', DICTIONARIES_ONLY_USER.email);
        await page.fill('input[name="password"]', DICTIONARIES_ONLY_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/admin/, { timeout: 10000 });
    });

    test('sidebar shows Settings page', async ({ page }) => {
        await page.goto('/admin/settings');
        await page.waitForLoadState('networkidle');

        const settingsMenu = page.locator('[data-testid="menu-settings"]');
        await expect(settingsMenu).toBeVisible();
    });

    test('settings opens to dictionaries tab with currency subTab', async ({ page }) => {
        await page.goto('/admin/settings');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/tab=dictionaries/);
        await expect(page).toHaveURL(/subTab=currency/);
    });

    test('only currency subTab is visible', async ({ page }) => {
        await page.goto('/admin/settings?tab=dictionaries&subTab=currency');
        await page.waitForLoadState('networkidle');

        const currencySubTab = page.getByText(/currency|valyuta/i);
        await expect(currencySubTab.first()).toBeVisible();

        const taxSubTab = page.locator('[data-subtab="tax"]');
        await expect(taxSubTab).toHaveCount(0);
    });

    // FAIL-CLOSED tests
    test('/admin/settings?tab=smtp shows terminal 403', async ({ page }) => {
        await page.goto('/admin/settings?tab=smtp');
        await page.waitForLoadState('networkidle');

        // Should show access-denied and stay
        await expect(page).toHaveURL(/access-denied/);
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/access-denied/);
    });

    test('/admin/settings?tab=general shows terminal 403', async ({ page }) => {
        await page.goto('/admin/settings?tab=general');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/access-denied/);
    });

    test('/admin/settings?tab=dictionaries&subTab=tax shows terminal 403', async ({ page }) => {
        await page.goto('/admin/settings?tab=dictionaries&subTab=tax');
        await page.waitForLoadState('networkidle');

        // Unauthorized subTab → terminal 403
        await expect(page).toHaveURL(/access-denied/);
    });

    test('other settings tabs are NOT in DOM', async ({ page }) => {
        await page.goto('/admin/settings?tab=dictionaries&subTab=currency');
        await page.waitForLoadState('networkidle');

        const generalTab = page.locator('[data-tab="general"]');
        await expect(generalTab).toHaveCount(0);

        const smtpTab = page.locator('[data-tab="smtp"]');
        await expect(smtpTab).toHaveCount(0);
    });
});
