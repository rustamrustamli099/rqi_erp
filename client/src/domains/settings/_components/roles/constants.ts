/**
 * SAP-GRADE Role Constants
 * 
 * Mərkəzləşdirilmiş sabitlər - backend-dən gələcək
 * data üçün hazır struktur.
 */

// Interfaces
interface ScopeOption {
    value: string;
    label: string;
    isAll?: boolean;
}

interface StatusOption {
    value: string;
    label: string;
    color?: string;
    isAll?: boolean;
}

// Role Scope Options
export const ROLE_SCOPES: ScopeOption[] = [
    { value: 'ALL', label: 'Hamısı', isAll: true },
    { value: 'TENANT', label: 'Tenant' },
    { value: 'SYSTEM', label: 'System' },
];

export type RoleScope = 'ALL' | 'TENANT' | 'SYSTEM';

// Role Status Options
export const ROLE_STATUSES: StatusOption[] = [
    { value: 'ALL', label: 'Hamısı', isAll: true },
    { value: 'ACTIVE', label: 'Aktiv', color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'DRAFT', label: 'Qaralama', color: 'text-slate-500 bg-slate-100 border-slate-200' },
    { value: 'PENDING_APPROVAL', label: 'Təsdiqdə', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { value: 'REJECTED', label: 'İmtina', color: 'text-red-600 bg-red-50 border-red-200' },
    { value: 'ARCHIVED', label: 'Arxiv', color: 'text-gray-500 bg-gray-100 border-gray-200' },
];

export type RoleStatus = 'ALL' | 'ACTIVE' | 'DRAFT' | 'PENDING_APPROVAL' | 'REJECTED' | 'ARCHIVED';

// Get status color helper
export function getStatusColor(status: string): string {
    const found = ROLE_STATUSES.find(s => s.value === status);
    return found?.color || 'text-gray-600 bg-gray-50 border-gray-200';
}

// Role Type Options (system vs custom)
export const ROLE_TYPES = [
    { value: 'system', label: 'Sistem Rolu', badge: 'System' },
    { value: 'custom', label: 'Xüsusi Rol', badge: null },
];

// Approval Actions
export const APPROVAL_ACTIONS = [
    { value: 'submit', label: 'Təsdiqə Göndər', icon: 'CheckCircle2', color: 'text-blue-600' },
    { value: 'approve', label: 'Təsdiqlə', icon: 'Check', color: 'text-green-600' },
    { value: 'reject', label: 'İmtina Et', icon: 'XCircle', color: 'text-red-600' },
];

// Default values
export const DEFAULT_ROLE_VALUES = {
    scope: 'TENANT' as RoleScope,
    status: 'DRAFT' as RoleStatus,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDir: 'desc' as const,
};

// Filter helper - get options without "ALL"
export function getScopeOptions(): ScopeOption[] {
    return ROLE_SCOPES.filter(s => !s.isAll);
}

export function getStatusOptions(): StatusOption[] {
    return ROLE_STATUSES.filter(s => !s.isAll);
}

