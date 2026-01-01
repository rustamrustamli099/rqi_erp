/**
 * PHASE 14G: Canonical Action Keys
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-GRADE semantic action identifiers for UI rendering.
 * SYNCED with permission-structure.ts action names.
 * 
 * RULES:
 * - UI MUST import keys from this file
 * - Hardcoded strings are FORBIDDEN
 * - Keys match backend page-state response format: GS_{ENTITY}_{ACTION}
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACTION_KEYS = {
    // ─────────────────────────────────────────────────────────────────────────
    // Tenants Entity (Phase 14G)
    // ─────────────────────────────────────────────────────────────────────────
    TENANTS_CREATE: 'GS_TENANTS_CREATE',
    TENANTS_UPDATE: 'GS_TENANTS_UPDATE',
    TENANTS_DELETE: 'GS_TENANTS_DELETE',
    TENANTS_IMPERSONATE: 'GS_TENANTS_IMPERSONATE',
    // Granular Actions (Phase 14G Refinement)
    TENANTS_MANAGE_USERS: 'GS_TENANTS_MANAGE_USERS',
    TENANTS_MANAGE_SECURITY: 'GS_TENANTS_MANAGE_SECURITY',
    TENANTS_MANAGE_BILLING: 'GS_TENANTS_MANAGE_BILLING',
    TENANTS_MANAGE_FEATURES: 'GS_TENANTS_MANAGE_FEATURES',
    TENANTS_MANAGE_CONTRACT: 'GS_TENANTS_MANAGE_CONTRACT',
    TENANTS_VIEW_AUDIT: 'GS_TENANTS_VIEW_AUDIT',
    TENANTS_EXPORT: 'GS_TENANTS_EXPORT_TO_EXCEL',

    // ─────────────────────────────────────────────────────────────────────────
    // Users Entity - Synced with permission-structure.ts
    // ─────────────────────────────────────────────────────────────────────────
    USERS_CREATE: 'GS_USERS_CREATE',
    USERS_READ: 'GS_USERS_READ',
    USERS_UPDATE: 'GS_USERS_UPDATE',
    USERS_DELETE: 'GS_USERS_DELETE',
    USERS_EXPORT: 'GS_USERS_EXPORT_TO_EXCEL',
    USERS_ACTIVATE: 'GS_USERS_CHANGE_STATUS',
    USERS_CONNECT_TO_EMPLOYEE: 'GS_USERS_CONNECT_TO_EMPLOYEE',
    USERS_INVITE: 'GS_USERS_INVITE',
    // Row-level actions
    USERS_IMPERSONATE: 'GS_USERS_IMPERSONATE',
    USERS_SEND_INVITE: 'GS_USERS_SEND_INVITE',
    USERS_MANAGE_RESTRICTIONS: 'GS_USERS_MANAGE_RESTRICTIONS',

    // ─────────────────────────────────────────────────────────────────────────
    // Roles Entity
    // ─────────────────────────────────────────────────────────────────────────
    ROLES_CREATE: 'GS_ROLES_CREATE',
    ROLES_READ: 'GS_ROLES_READ',
    ROLES_UPDATE: 'GS_ROLES_UPDATE',
    ROLES_DELETE: 'GS_ROLES_DELETE',
    ROLES_EXPORT: 'GS_ROLES_EXPORT_TO_EXCEL',
    ROLES_SUBMIT: 'GS_ROLES_SUBMIT',
    ROLES_APPROVE: 'GS_ROLES_APPROVE',
    ROLES_REJECT: 'GS_ROLES_REJECT',

    // ─────────────────────────────────────────────────────────────────────────
    // Curators Entity - Synced with permission-structure.ts
    // ─────────────────────────────────────────────────────────────────────────
    CURATORS_CREATE: 'GS_CURATORS_CREATE',
    CURATORS_READ: 'GS_CURATORS_READ',
    CURATORS_UPDATE: 'GS_CURATORS_UPDATE',
    CURATORS_DELETE: 'GS_CURATORS_DELETE',
    CURATORS_EXPORT: 'GS_CURATORS_EXPORT_TO_EXCEL',
    CURATORS_CHANGE_STATUS: 'GS_CURATORS_CHANGE_STATUS',
    CURATORS_COPY_ID: 'GS_CURATORS_COPY_ID',
} as const;

// Type for action keys
export type ActionKey = typeof ACTION_KEYS[keyof typeof ACTION_KEYS];

// Type for actions map from pageState
export type ActionsMap = Record<ActionKey, boolean>;
