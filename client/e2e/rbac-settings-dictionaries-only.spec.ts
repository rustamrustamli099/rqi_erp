/**
 * SAP-Grade E2E Test: Settings Dictionaries Currency-Only (Flicker-Free)
 * 
 * Tests flicker-free navigation for unauthorized tabs/subtabs
 */

import { test, expect } from '@playwright/test';

const DICTIONARIES_ONLY_USER = {
    email: 'dictionaries-currency@test.com',
    password: 'TestPassword123!'
};

test.describe('RBAC: Settings Dictionaries Currency-Only - Flicker-Free', () => {

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
    });

    // FLICKER-FREE tests
    test('?tab=smtp redirects to dictionaries (NO /access-denied)', async ({ page }) => {
        const navigations: string[] = [];
        page.on('framenavigated', (frame) => {
            if (frame === page.mainFrame()) {
                navigations.push(frame.url());
            }
        });

        await page.goto('/admin/settings?tab=smtp');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/tab=dictionaries/);

        const visitedAccessDenied = navigations.some(url => url.includes('access-denied'));
        expect(visitedAccessDenied).toBe(false);
    });

    test('?tab=general redirects to dictionaries (NO flicker)', async ({ page }) => {
        await page.goto('/admin/settings?tab=general');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/tab=dictionaries/);
        await expect(page).not.toHaveURL(/access-denied/);
    });

    test('?subTab=tax redirects to currency (NO flicker)', async ({ page }) => {
        await page.goto('/admin/settings?tab=dictionaries&subTab=tax');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/subTab=currency/);
        await expect(page).not.toHaveURL(/access-denied/);
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
