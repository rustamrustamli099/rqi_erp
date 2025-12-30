/**
 * SAP-Grade E2E Test: Settings Dictionaries Currency-Only (Flicker-Free)
 * 
 * Tests:
 * - Parent tab visible when user has granular child permission
 * - Only allowed subTabs render (NOT in DOM: sectors, units, timezones, address)
 * - URL subTab clamped without /access-denied flash
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

    test('sidebar shows Settings page (granular permission grants parent access)', async ({ page }) => {
        await page.goto('/admin/settings');
        await page.waitForLoadState('networkidle');

        const settingsMenu = page.locator('[data-testid="menu-settings"], a[href*="/admin/settings"]');
        await expect(settingsMenu.first()).toBeVisible();
    });

    test('settings opens to dictionaries tab with currency subTab', async ({ page }) => {
        await page.goto('/admin/settings');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/tab=dictionaries/);
        await expect(page).toHaveURL(/subTab=currency/);
    });

    test('SAP: only currency subTab trigger is in DOM', async ({ page }) => {
        await page.goto('/admin/settings?tab=dictionaries&subTab=currency');
        await page.waitForLoadState('networkidle');

        // Currency subTab MUST be visible
        const currencySubTab = page.getByRole('tab', { name: /valyuta|currency/i });
        await expect(currencySubTab.first()).toBeVisible();

        // SAP-GRADE: Unauthorized subTabs NOT in DOM
        const sectorsSubTab = page.getByRole('tab', { name: /sektor/i });
        await expect(sectorsSubTab).toHaveCount(0);

        const unitsSubTab = page.getByRole('tab', { name: /ölçü vahid/i });
        await expect(unitsSubTab).toHaveCount(0);
    });

    test('SAP: ?tab=smtp redirects to dictionaries (NO /access-denied)', async ({ page }) => {
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

    test('SAP: ?tab=general redirects to dictionaries (NO flicker)', async ({ page }) => {
        await page.goto('/admin/settings?tab=general');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/tab=dictionaries/);
        await expect(page).not.toHaveURL(/access-denied/);
    });

    test('SAP: ?subTab=sectors redirects to currency (NO flicker)', async ({ page }) => {
        await page.goto('/admin/settings?tab=dictionaries&subTab=sectors');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/subTab=currency/);
        await expect(page).not.toHaveURL(/access-denied/);
    });

    test('SAP: other settings tabs are NOT in DOM', async ({ page }) => {
        await page.goto('/admin/settings?tab=dictionaries&subTab=currency');
        await page.waitForLoadState('networkidle');

        // These tabs should NOT render (no permission)
        const generalTab = page.locator('button:has-text("Şirkət Profili")');
        await expect(generalTab).toHaveCount(0);

        const smtpTab = page.locator('button:has-text("SMTP Email")');
        await expect(smtpTab).toHaveCount(0);

        const securityTab = page.locator('button:has-text("Təhlükəsizlik Siyasəti")');
        await expect(securityTab).toHaveCount(0);
    });

    test('SAP: no "icazəniz yoxdur" message for valid navigation', async ({ page }) => {
        await page.goto('/admin/settings?tab=dictionaries&subTab=currency');
        await page.waitForLoadState('networkidle');

        // Should NOT see access denied message
        const accessDeniedMsg = page.getByText(/icazəniz yoxdur|permission/i);
        await expect(accessDeniedMsg).toHaveCount(0);
    });
});
