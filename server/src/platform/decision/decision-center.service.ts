import { Injectable } from '@nestjs/common';
import { MenuItem } from '../menu/menu.definition';
import { ACTION_PERMISSIONS_REGISTRY } from './action.registry';

/**
 * SAP-GRADE DECISION CENTER
 * 
 * CORE RESPONSIBILITY:
 * - Pure Logic Engine (No DB, No External Calls)
 * - Input: Permissions + Menu Structure
 * - Output: Resolved Visibility Tree
 * 
 * RULES:
 * 1. Containers have NO permissions.
 * 2. Parent is visible if ANY child is visible.
 * 3. Atomic permissions (1 Action = 1 Permission).
 */
@Injectable()
export class DecisionCenterService {

    /**
     * Resolves the navigation tree based on user permissions.
     * @param tree The raw menu tree structure.
     * @param userPermissions A flat list of permission slugs the user possesses.
     * @returns A filtered tree containing only visible items.
     */
    resolveNavigationTree(tree: MenuItem[], userPermissions: string[]): MenuItem[] {
        // Fast lookup set
        const permissionSet = new Set(userPermissions);
        return this.filterNodes(tree, permissionSet);
    }

    private filterNodes(nodes: MenuItem[], permissionSet: Set<string>): MenuItem[] {
        const resolved: MenuItem[] = [];

        for (const node of nodes) {
            // 1. Check Atomic Permission
            if (node.permission && !permissionSet.has(node.permission)) {
                // [STRICT] If node has explicit permission and user lacks it -> HIDDEN
                continue;
            }

            // 2. Process Children (Recursive)
            let visibleChildren: MenuItem[] = [];
            if (node.children && node.children.length > 0) {
                visibleChildren = this.filterNodes(node.children, permissionSet);
            }

            // 3. Container Visibility Rule
            // If a node has children (is a Container) AND has no explicit permission:
            // It is VISIBLE if and only if AT LEAST ONE child is visible.
            const isContainer = node.children && node.children.length > 0;
            const hasExplicitPermission = !!node.permission;

            if (isContainer && !hasExplicitPermission) {
                if (visibleChildren.length === 0) {
                    continue; // Auto-Hide empty container
                }
            }

            // 4. Resolve Contextual Actions (SAP-Grade Enrichment)
            // Backend attaches actions for UI to consume directly
            const actions = this.resolveActionsForNode(node.id, permissionSet);

            // 5. Construct Result Node
            // Clone to avoid mutating original definition
            const resolvedNode: MenuItem = {
                ...node,
                children: visibleChildren.length > 0 ? visibleChildren : undefined,
                actions // Attach actions
            };

            resolved.push(resolvedNode);
        }

        return resolved;
    }

    /**
     * Helper to resolve actions for a specific node/entity
     */
    private resolveActionsForNode(nodeId: string, permissionSet: Set<string>): any {
        const config = ACTION_PERMISSIONS_REGISTRY.find(c => c.entityKey === nodeId);

        // DEBUG: Log the resolution attempt
        console.log(`[DecisionCenter] resolveActionsForNode: nodeId=${nodeId}, configFound=${!!config}`);

        if (!config) return undefined;

        const resolvedActions = config.actions.map(a => ({
            actionKey: a.actionKey,
            // SAP Rule: If user has permission -> enabled. Else -> hidden.
            // We can strictly hide denied actions.
            state: permissionSet.has(a.permissionSlug) ? 'enabled' : 'hidden',
            label: a.actionKey // Add label for UI
        })).filter(a => a.state !== 'hidden');

        // DEBUG: Log resolved actions
        console.log(`[DecisionCenter] nodeId=${nodeId}: resolved ${resolvedActions.length} actions:`, resolvedActions.map(a => a.actionKey));

        if (resolvedActions.length === 0) return undefined;

        // Mimic legacy 'byContext' structure for frontend compatibility
        const toolbarKeys = ['create', 'export_to_excel', 'submit', 'approve', 'reject', 'import', 'manage_seats', 'download_json_soc2', 'download_json_iso', 'generate_evidence', 'download_report'];
        const rowKeys = ['update', 'delete', 'read', 'change_status', 'impersonate', 'view_audit', 'cancel', 'select_permissions', 'copy', 'view_audit_log'];

        return {
            actions: resolvedActions,
            byContext: {
                toolbar: resolvedActions.filter(a => toolbarKeys.includes(a.actionKey)),
                row: resolvedActions.filter(a => rowKeys.includes(a.actionKey) || !toolbarKeys.includes(a.actionKey)) // Default to row if not in toolbar?
            }
        };
    }

    /**
     * Resolves the list of authorized actions for the UI.
     * In the SAP-Grade model, Action = Permission (Exact Match).
     */
    resolveActions(userPermissions: string[]): string[] {
        // [STRICT] Passthrough - The permissions ARE the actions.
        // Future extensions could map these to UI-specific action IDs if needed.
        return userPermissions;
    }

    /**
     * Determines the canonical (default) route for the user based on the resolved tree.
     * Returns the path of the first visible leaf node.
     */
    getCanonicalPath(resolvedTree: MenuItem[]): string | null {
        for (const node of resolvedTree) {
            if (node.path && !node.children) {
                return node.path;
            }
            if (node.children && node.children.length > 0) {
                const childPath = this.getCanonicalPath(node.children);
                if (childPath) return childPath;
            }
        }
        return null;
    }

    /**
     * Evaluates if a specific route is accessible.
     * Use this for Guard logic or direct checks.
     */
    evaluateRoute(tree: MenuItem[], userPermissions: string[], path: string): boolean {
        // Simple implementation: Resolve tree and check if path exists in resolved tree.
        // Optimization: Could act as a tailored search without full tree resolution.
        const resolvedTree = this.resolveNavigationTree(tree, userPermissions);
        return this.findPathInTree(resolvedTree, path);
    }

    private findPathInTree(nodes: MenuItem[], path: string): boolean {
        for (const node of nodes) {
            if (node.path === path) return true;
            if (node.children) {
                if (this.findPathInTree(node.children, path)) return true;
            }
        }
        return false;
    }
}
