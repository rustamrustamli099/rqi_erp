/**
 * Unit Tests - TAB_SUBTAB Registry Functions
 * 
 * SAP-GRADE: Tests use registry helper functions only.
 * NO duplicate decision centers.
 */

import { describe, it, expect } from 'vitest';
import {
    normalizePermissions,
    getFirstAllowedTab,
    canAccessPage
} from '@/app/navigation/tabSubTab.registry';

describe('normalizePermissions', () => {
    it('should add read when write actions exist', () => {
        const perms = ['system.users.create', 'system.users.delete'];
        const normalized = normalizePermissions(perms);

        expect(normalized).toContain('system.users.create');
        expect(normalized).toContain('system.users.read'); // Implied
    });

    it('should not duplicate read', () => {
        const perms = ['system.users.read', 'system.users.update'];
        const normalized = normalizePermissions(perms);

        const readCount = normalized.filter(p => p === 'system.users.read').length;
        expect(readCount).toBe(1);
    });
});

describe('getFirstAllowedTab - Users Page', () => {
    it('curators-only user should land on curators tab', () => {
        const perms = ['system.users.curators.read'];
        const result = getFirstAllowedTab('admin.users', perms, 'admin');

        expect(result).toEqual({ tab: 'curators' });
    });

    it('users-only user should land on users tab', () => {
        const perms = ['system.users.users.read'];
        const result = getFirstAllowedTab('admin.users', perms, 'admin');

        expect(result).toEqual({ tab: 'users' });
    });

    it('both permissions - priority order (users first)', () => {
        const perms = ['system.users.users.read', 'system.users.curators.read'];
        const result = getFirstAllowedTab('admin.users', perms, 'admin');

        expect(result).toEqual({ tab: 'users' });
    });
});

describe('canAccessPage', () => {
    it('curators-only user can access Users page', () => {
        const perms = ['system.users.curators.read'];
        const result = canAccessPage('admin.users', perms, 'admin');

        expect(result).toBe(true);
    });

    it('no permissions - cannot access Users page', () => {
        const perms: string[] = [];
        const result = canAccessPage('admin.users', perms, 'admin');

        expect(result).toBe(false);
    });
});

describe('SAP Visibility Law', () => {
    it('page is accessible when only one child tab is allowed', () => {
        // User with only one tab permission
        const perms = ['system.settings.system_configurations.billing_configurations.invoice.read'];

        // Settings page should be accessible (via billing_config > invoice)
        const canAccess = canAccessPage('admin.settings', perms, 'admin');
        expect(canAccess).toBe(true);
    });

    it('page not accessible when no tabs allowed', () => {
        const perms = ['unrelated.permission'];

        const canAccess = canAccessPage('admin.settings', perms, 'admin');
        expect(canAccess).toBe(false);
    });
});
