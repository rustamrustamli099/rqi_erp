/**
 * SAP-Grade Permission Normalization Engine
 * 
 * Enterprise RBAC Qaydaları:
 * 1. Non-read action varsa (CREATE/UPDATE/DELETE) → həmin module üçün .read avtomatik əlavə olunur
 * 2. Child permission varsa → parent module .read avtomatik əlavə olunur
 * 3. Bütün səviyyələrdə .access permission-lar yaradılır (navigation üçün)
 * 
 * Nümunə:
 *   Input: ['system.billing.plans.create']
 *   Output: [
 *     'system.billing.plans.create',  // Original
 *     'system.billing.plans.read',    // Rule 1: non-read implies read
 *     'system.billing.read',          // Rule 2: child implies parent read
 *     'system.access',                // Rule 3: navigation access
 *     'system.billing.access',        // Rule 3: navigation access
 *     'system.billing.plans.access'   // Rule 3: navigation access
 *   ]
 */
export function normalizePermissions(explicitPerms: string[]): string[] {
    const derivedPerms = new Set<string>();

    // Non-read actions that imply read access
    const NON_READ_ACTIONS = [
        'create', 'update', 'delete', 'manage', 'approve', 'reject',
        'export', 'export_to_excel', 'download', 'upload', 'execute',
        'configure', 'submit', 'forward', 'impersonate', 'invite',
        'change_status', 'toggle', 'simulate', 'test_connection'
    ];

    explicitPerms.forEach(perm => {
        if (!perm || typeof perm !== 'string') return;

        derivedPerms.add(perm); // Always add original

        const parts = perm.split('.');
        if (parts.length < 2) return;

        const action = parts[parts.length - 1];
        const scope = parts[0]; // 'system' or 'tenant'

        // Rule 1: Non-read action implies read
        // e.g. system.billing.plans.create → system.billing.plans.read
        if (NON_READ_ACTIONS.includes(action)) {
            const readPerm = [...parts.slice(0, -1), 'read'].join('.');
            derivedPerms.add(readPerm);
        }

        // Rule 2: Child permission implies parent read
        // e.g. system.billing.plans.read → system.billing.read
        // We iterate from the module level up to (but not including) the leaf action
        for (let i = 2; i < parts.length - 1; i++) {
            const parentPath = parts.slice(0, i).join('.');
            derivedPerms.add(`${parentPath}.read`);
        }

        // Rule 3: Generate .access permissions for navigation (existing logic)
        let currentPath = scope;
        for (let i = 1; i < parts.length; i++) {
            derivedPerms.add(`${currentPath}.access`);
            currentPath += `.${parts[i]}`;
        }
    });

    // Sort for deterministic output and easier debugging
    return Array.from(derivedPerms).sort();
}
