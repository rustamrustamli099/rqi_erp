
// import { PLATFORM_MENU } from "@/app/navigation/menu.definitions";
const PLATFORM_MENU: any[] = []; // Deprecated Stub

// --- LOCAL INTERFACE DEFINITION TO PREVENT IMPORT ERRORS ---
// (Mirroring menu.definitions.ts structure to avoid 'does not provide an export' runtime errors)
// RENAMED FILE TO FORCE VITE REBUILD
interface MenuItem {
    id: string;
    label: string;
    path?: string;
    icon?: any;
    requiredPermissions?: string[];
    children?: MenuItem[];
    info?: string;
}

export interface PreviewResult {
    visibleMenuIds: string[];
    visibleTabs: Record<string, string[]>; // path (e.g. /admin/settings) -> list of query strings (e.g. "tab=dictionaries")
    visibleRoutes: string[];
    firstAllowedRoute: string | null;
    riskFlags: string[];
    stats: {
        totalMenus: number;
        visibleMenus: number;
        accessibleTabs: number;
    }
}

const RISKY_ACTIONS = ['delete', 'export', 'impersonate', 'manage', 'execute', 'approve'];

/**
 * Calculates what a user would see and access based on a list of permission slugs.
 * Uses the Deterministic Visibility Rule:
 * 1. Leaf Node (Direct Route/Action): Visible IF user has `requiredPermissions` (ALL of them, usually just 1 READ).
 * 2. Group Node (Parent): Visible IF at least one child is visible.
 */
export function calculateUserAccess(userPermissions: string[]): PreviewResult {
    const visibleMenuIds: Set<string> = new Set();
    const visibleRoutes: Set<string> = new Set(); // Stores full paths
    const visibleTabs: Record<string, string[]> = {};
    const riskFlags: Set<string> = new Set();

    let totalMenus = 0;

    // 1. Identify Risk Flags
    userPermissions.forEach(perm => {
        const parts = perm.split('.');
        const action = parts[parts.length - 1];
        if (RISKY_ACTIONS.includes(action) || RISKY_ACTIONS.some(r => perm.includes(r))) {
            riskFlags.add(perm);
        }
    });

    // 2. Recursive Walker
    function processNode(item: MenuItem): boolean {
        totalMenus++;
        let isVisible = false;

        // Check Children First (Bottom-Up Visibility)
        let hasVisibleChild = false;
        if (item.children && item.children.length > 0) {
            for (const child of item.children) {
                const childVisible = processNode(child);
                if (childVisible) hasVisibleChild = true;
            }
        }

        // Check Direct Permissions
        const hasDirectPerms = item.requiredPermissions ?
            item.requiredPermissions.every(req => userPermissions.includes(req)) :
            true;

        if (item.children && item.children.length > 0) {
            // Group Node
            if (item.requiredPermissions && item.requiredPermissions.length > 0) {
                isVisible = hasDirectPerms;
            } else {
                isVisible = hasVisibleChild;
            }
        } else {
            // Leaf Node
            isVisible = hasDirectPerms;
        }

        if (isVisible) {
            visibleMenuIds.add(item.id);
            if (item.path) {
                visibleRoutes.add(item.path);

                // Tab Analysis
                try {
                    const url = new URL(item.path, 'http://dummy.com');
                    const tab = url.searchParams.get('tab');
                    const subTab = url.searchParams.get('subTab');
                    const basePath = url.pathname;

                    if (tab || subTab) {
                        if (!visibleTabs[basePath]) visibleTabs[basePath] = [];
                        let query = `tab=${tab}`;
                        if (subTab) query += `&subTab=${subTab}`;
                        if (!visibleTabs[basePath].includes(query)) {
                            visibleTabs[basePath].push(query);
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }
        }

        return isVisible;
    }

    // Start Walking
    (PLATFORM_MENU as any[]).forEach(root => processNode(root));

    // Determine First Allowed Route (Deterministic)
    let firstAllowed: string | null = null;

    function findFirst(items: MenuItem[]): string | null {
        for (const item of items) {
            if (visibleMenuIds.has(item.id)) {
                if (item.path && !item.children) return item.path; // Found a leaf!
                if (item.children) {
                    const childPath = findFirst(item.children);
                    if (childPath) return childPath;
                }
            }
        }
        return null;
    }

    firstAllowed = findFirst(PLATFORM_MENU as any[]);

    return {
        visibleMenuIds: Array.from(visibleMenuIds),
        visibleTabs,
        visibleRoutes: Array.from(visibleRoutes),
        firstAllowedRoute: firstAllowed,
        riskFlags: Array.from(riskFlags),
        stats: {
            totalMenus,
            visibleMenus: visibleMenuIds.size,
            accessibleTabs: Object.values(visibleTabs).flat().length
        }
    };
}
