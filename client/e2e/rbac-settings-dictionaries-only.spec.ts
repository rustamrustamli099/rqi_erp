/**
 * RBAC E2E Test: Settings Dictionaries Currency-Only User
 * 
 * Scenario: User has ONLY system.settings.system_configurations.dictionary.currency.read
 * 
 * Expected:
 * - Sidebar: Settings page visible
 * - /admin/settings opens to ?tab=dictionaries&subTab=currency
 * - Other dictionaries subTabs NOT rendered
 */

import { test, expect } from '@playwright/test';

const DICTIONARIES_ONLY_USER = {
    email: 'dictionaries-currency@test.com',
    password: 'TestPassword123!'
};

test.describe('RBAC: Settings Dictionaries Currency-Only User', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', DICTIONARIES_ONLY_USER.email);
        await page.fill('input[name="password"]', DICTIONARIES_ONLY_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/admin/);
    });

    test('sidebar shows Settings page', async ({ page }) => {
        const settingsMenuItem = page.locator('[data-testid="menu-settings"], a[href*="/admin/settings"]');
        await expect(settingsMenuItem).toBeVisible();
    });

    test('settings opens to dictionaries tab with currency subTab', async ({ page }) => {
        await page.goto('/admin/settings');
        await page.waitForURL(/tab=dictionaries/);

        expect(page.url()).toContain('tab=dictionaries');
        expect(page.url()).toContain('subTab=currency');
    });

    test('only currency subTab is visible', async ({ page }) => {
        await page.goto('/admin/settings?tab=dictionaries&subTab=currency');
        await page.waitForLoadState('networkidle');

        // Currency should be visible
        const currencySubTab = page.locator('[data-subtab="currency"], button:has-text("Valyuta")');
        await expect(currencySubTab.first()).toBeVisible();

        // Tax subTab should NOT be in DOM
        const taxSubTab = page.locator('[data-subtab="tax"]');
        await expect(taxSubTab).toHaveCount(0);
    });

    test('other settings tabs are hidden', async ({ page }) => {
        await page.goto('/admin/settings?tab=dictionaries&subTab=currency');
        await page.waitForLoadState('networkidle');

        // General tab should not be visible
        const generalTab = page.locator('[data-tab="general"]');
        await expect(generalTab).toHaveCount(0);
    });
});
