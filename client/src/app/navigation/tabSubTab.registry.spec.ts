/**
 * Unit Tests - TAB_SUBTAB Registry & Permission Preview Engine
 */

import { describe, it, expect } from 'vitest';
import {
    normalizePermissions,
    getFirstAllowedTab,
    canAccessPage
} from '@/app/navigation/tabSubTab.registry';
import { PermissionPreviewEngine } from '@/domains/auth/utils/permissionPreviewEngine';

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

describe('PermissionPreviewEngine', () => {
    it('curators-only user sees Users menu with correct landing', () => {
        const perms = ['system.users.curators.read'];
        const result = PermissionPreviewEngine.run(perms, 'admin');

        const usersMenu = result.visibleMenus.find(m => m.menuId === 'admin.users');
        expect(usersMenu).toBeDefined();
        expect(usersMenu?.landingPath).toBe('/admin/users?tab=curators');
    });

    it('no permissions - access denied', () => {
        const perms: string[] = [];
        const result = PermissionPreviewEngine.run(perms, 'admin');

        expect(result.visibleMenus.length).toBe(0);
        expect(result.firstLandingPath).toBe('/access-denied');
    });

    it('write action implies read for navigation', () => {
        const perms = ['system.users.curators.create']; // No read, only create
        const result = PermissionPreviewEngine.run(perms, 'admin');

        // Should still be able to see Users page (read implied)
        const usersPage = result.pages.find(p => p.pageKey === 'admin.users');
        expect(usersPage?.allowed).toBe(true);
    });
});
