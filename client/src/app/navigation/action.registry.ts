/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade ACTION_PERMISSIONS_REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CONSTITUTIONAL DEFINITION:
 * This registry defines CANONICAL AUTHORIZATION METADATA for actions.
 * It is equivalent to SAP PFCG Authorization Objects / Transaction Codes.
 * 
 * THIS REGISTRY:
 * ❌ DOES NOT decide
 * ❌ DOES NOT evaluate
 * ❌ DOES NOT filter
 * ❌ DOES NOT infer visibility
 * ❌ DOES NOT contain resolver logic
 * 
 * ✅ ONLY describes permission requirements for actions
 * 
 * SAP LAW:
 * - 1 Action = 1 Permission (EXACT MATCH)
 * - No wildcards
 * - No partial match
 * - No hierarchy inference
 * - No OR/AND/ANY semantics
 * 
 * DESIGN PRINCIPLES:
 * - String-based action keys (supports unlimited actions)
 * - Order-independent structure
 * - Context-aware (toolbar/row/form) but NOT UI-driven
 * - Open to ANY future action without redesign
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Action Context - WHERE the action appears
 * This is metadata, NOT UI logic
 */
export type ActionContext = 'toolbar' | 'row' | 'form' | 'bulk' | 'nav';

/**
 * Single Action Permission Definition
 * Equivalent to SAP Transaction Code definition
 * 
 * SAP LAW: 1 Action = 1 Permission (EXACT MATCH)
 */
export interface ActionPermissionDef {
    /** 
     * Action key - string-based, open-ended
     * Examples: 'create', 'approve', 'change_status', 'export', 'assign'
     * NOT limited to CRUD
     */
    actionKey: string;

    /**
     * Permission slug required (EXACT match)
     * 1:1 relationship - one action maps to exactly one permission
     */
    permissionSlug: string;

    /**
     * Contexts where this action can appear
     * Metadata only - UI context, NOT UI logic
     */
    contexts: ActionContext[];

    /**
     * Human-readable label for audit/documentation
     */
    label: string;
}

/**
 * Entity Action Configuration
 * Groups all actions for a specific entity (e.g., roles, users, invoices)
 */
export interface EntityActionConfig {
    /**
     * Entity key - matches page/tab/subTab structure
     * e.g., 'roles', 'users', 'invoices'
     */
    entityKey: string;

    /**
     * Scope context
     */
    scope: 'system' | 'tenant';

    /**
     * All actions available for this entity
     * Order-independent - NO [0] or first-element logic allowed
     */
    actions: ActionPermissionDef[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry Definition
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ACTION_PERMISSIONS_REGISTRY
 * 
 * Canonical definition of all action-level permissions.
 * This is pure metadata - NO logic, NO evaluation, NO visibility decisions.
 * 
 * Designed to support:
 * - Hundreds/thousands of actions
 * - CRUD + Workflow + Domain-specific actions
 * - Future unknown actions without redesign
 */
export const ACTION_PERMISSIONS_REGISTRY: EntityActionConfig[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // SYSTEM SCOPE - Admin Panel Entities
    // ═══════════════════════════════════════════════════════════════════════

    // ─────────────────────────────────────────────────────────────────────────
    // Roles Entity
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'roles',
        scope: 'system',
        actions: [
            // CRUD Actions
            {
                actionKey: 'create',
                permissionSlug: 'system.settings.security.user_rights.roles.create',
                contexts: ['toolbar'],
                label: 'Rol Yarat',
            },
            {
                actionKey: 'read',
                permissionSlug: 'system.settings.security.user_rights.roles.read',
                contexts: ['row'],
                label: 'Rolu Gör',
            },
            {
                actionKey: 'update',
                permissionSlug: 'system.settings.security.user_rights.roles.update',
                contexts: ['row'],
                label: 'Rolu Düzəlt',
            },
            {
                actionKey: 'delete',
                permissionSlug: 'system.settings.security.user_rights.roles.delete',
                contexts: ['row'],
                label: 'Rolu Sil',
            },
            // Workflow Actions
            {
                actionKey: 'submit',
                permissionSlug: 'system.settings.security.user_rights.roles.submit',
                contexts: ['row', 'form'],
                label: 'Təsdiqə Göndər',
            },
            // Domain Actions
            {
                actionKey: 'manage_permissions',
                permissionSlug: 'system.settings.security.user_rights.roles.manage_permissions',
                contexts: ['row', 'form'],
                label: 'İcazələri İdarə Et',
            },
            {
                actionKey: 'change_status',
                permissionSlug: 'system.settings.security.user_rights.roles.change_status',
                contexts: ['row'],
                label: 'Statusu Dəyiş',
            },
            {
                actionKey: 'copy',
                permissionSlug: 'system.settings.security.user_rights.roles.copy',
                contexts: ['row'],
                label: 'Rolu Kopyala',
            },
            {
                actionKey: 'export_to_excel',
                permissionSlug: 'system.settings.security.user_rights.roles.export_to_excel',
                contexts: ['toolbar'],
                label: 'İxrac Et',
            },
            {
                actionKey: 'view_audit_log',
                permissionSlug: 'system.settings.security.user_rights.roles.view_audit_log',
                contexts: ['row'],
                label: 'Tarixçəyə Bax',
            },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Matrix View Entity
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'matrix_view',
        scope: 'system',
        actions: [
            {
                actionKey: 'read',
                permissionSlug: 'system.settings.security.user_rights.matrix_view.read',
                contexts: ['nav'],
                label: 'Görüntüləmə',
            },
            {
                actionKey: 'update',
                permissionSlug: 'system.settings.security.user_rights.matrix_view.update',
                contexts: ['toolbar'],
                label: 'Redaktə Et',
            },
        ],
    },
    // ─────────────────────────────────────────────────────────────────────────
    // Compliance Entity
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'compliance',
        scope: 'system',
        actions: [
            {
                actionKey: 'read',
                permissionSlug: 'system.settings.security.user_rights.compliance.read',
                contexts: ['nav'],
                label: 'Görüntüləmə',
            },
            {
                actionKey: 'download_report',
                permissionSlug: 'system.settings.security.user_rights.compliance.download_report',
                contexts: ['toolbar'],
                label: 'Hesabatı Yüklə',
            },
            {
                actionKey: 'generate_evidence',
                permissionSlug: 'system.settings.security.user_rights.compliance.generate_evidence',
                contexts: ['toolbar'],
                label: 'Sübut Generasiya Et',
            },
            {
                actionKey: 'download_json_soc2',
                permissionSlug: 'system.settings.security.user_rights.compliance.download_json_soc2',
                contexts: ['toolbar'],
                label: 'SOC2 JSON Yüklə',
            },
            {
                actionKey: 'download_json_iso',
                permissionSlug: 'system.settings.security.user_rights.compliance.download_json_iso',
                contexts: ['toolbar'],
                label: 'ISO JSON Yüklə',
            },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Users Entity
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'users',
        scope: 'system',
        actions: [
            {
                actionKey: 'create',
                permissionSlug: 'system.users.users.create',
                contexts: ['toolbar'],
                label: 'İstifadəçi Yarat',
            },
            {
                actionKey: 'read',
                permissionSlug: 'system.users.users.read',
                contexts: ['row'],
                label: 'İstifadəçini Gör',
            },
            {
                actionKey: 'update',
                permissionSlug: 'system.users.users.update',
                contexts: ['row'],
                label: 'İstifadəçini Düzəlt',
            },
            {
                actionKey: 'delete',
                permissionSlug: 'system.users.users.delete',
                contexts: ['row'],
                label: 'İstifadəçini Sil',
            },
            {
                actionKey: 'activate',
                permissionSlug: 'system.users.users.activate',
                contexts: ['row'],
                label: 'Aktivləşdir',
            },
            {
                actionKey: 'deactivate',
                permissionSlug: 'system.users.users.deactivate',
                contexts: ['row'],
                label: 'Deaktiv Et',
            },
            {
                actionKey: 'reset_password',
                permissionSlug: 'system.users.users.reset_password',
                contexts: ['row'],
                label: 'Şifrəni Sıfırla',
            },
            {
                actionKey: 'assign_roles',
                permissionSlug: 'system.users.users.assign_roles',
                contexts: ['row', 'form'],
                label: 'Rol Təyin Et',
            },
            {
                actionKey: 'impersonate',
                permissionSlug: 'system.users.users.impersonate',
                contexts: ['row'],
                label: 'Kimi Giriş Et',
            },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Curators Entity
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'curators',
        scope: 'system',
        actions: [
            {
                actionKey: 'create',
                permissionSlug: 'system.users.curators.create',
                contexts: ['toolbar'],
                label: 'Kurator Yarat',
            },
            {
                actionKey: 'read',
                permissionSlug: 'system.users.curators.read',
                contexts: ['row'],
                label: 'Kuratoru Gör',
            },
            {
                actionKey: 'update',
                permissionSlug: 'system.users.curators.update',
                contexts: ['row'],
                label: 'Kuratoru Düzəlt',
            },
            {
                actionKey: 'delete',
                permissionSlug: 'system.users.curators.delete',
                contexts: ['row'],
                label: 'Kuratoru Sil',
            },
            {
                actionKey: 'assign_tenants',
                permissionSlug: 'system.users.curators.assign_tenants',
                contexts: ['row', 'form'],
                label: 'Tenant Təyin Et',
            },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Tenants Entity
    // ─────────────────────────────────────────────────────────────────────────
    {
        entityKey: 'tenants',
        scope: 'system',
        actions: [
            {
                actionKey: 'create',
                permissionSlug: 'system.tenants.create',
                contexts: ['toolbar'],
                label: 'Tenant Yarat',
            },
            {
                actionKey: 'read',
                permissionSlug: 'system.tenants.read',
                contexts: ['row'],
                label: 'Tenant Gör',
            },
            {
                actionKey: 'update',
                permissionSlug: 'system.tenants.update',
                contexts: ['row'],
                label: 'Tenant Düzəlt',
            },
            {
                actionKey: 'delete',
                permissionSlug: 'system.tenants.delete',
                contexts: ['row'],
                label: 'Tenant Sil',
            },
            {
                actionKey: 'suspend',
                permissionSlug: 'system.tenants.suspend',
                contexts: ['row'],
                label: 'Dayandır',
            },
            {
                actionKey: 'activate',
                permissionSlug: 'system.tenants.activate',
                contexts: ['row'],
                label: 'Aktivləşdir',
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TENANT SCOPE - Will be extended in future phases
    // ═══════════════════════════════════════════════════════════════════════
];

// ═══════════════════════════════════════════════════════════════════════════
// Lookup Helpers (PURE DATA ACCESS - NO DECISION LOGIC)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get entity action config by entityKey and scope
 * DOES NOT evaluate permissions - only returns canonical data
 */
export function getEntityActionConfig(
    entityKey: string,
    scope: 'system' | 'tenant'
): EntityActionConfig | undefined {
    return ACTION_PERMISSIONS_REGISTRY.find(
        e => e.entityKey === entityKey && e.scope === scope
    );
}

/**
 * Get specific action definition
 * DOES NOT evaluate permissions - only returns canonical data
 */
export function getActionDef(
    entityKey: string,
    scope: 'system' | 'tenant',
    actionKey: string
): ActionPermissionDef | undefined {
    const entity = getEntityActionConfig(entityKey, scope);
    if (!entity) return undefined;
    return entity.actions.find(a => a.actionKey === actionKey);
}
