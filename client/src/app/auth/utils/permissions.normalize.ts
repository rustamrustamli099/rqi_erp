// SAP-Grade Implicit Access Resolution Engine
// Logic: Operation Permissions (READ/UPDATE) -> Implies Navigation Permissions (ACCESS)

export function normalizePermissions(explicitPerms: string[]): string[] {
    const derivedPerms = new Set<string>();

    explicitPerms.forEach(p => {
        derivedPerms.add(p); // Add original

        // Logic: Split by dot, find parents, append .access
        const parts = p.split('.');
        // e.g. system.settings.general.read

        let currentPath = parts[0];
        for (let i = 1; i < parts.length; i++) {
            // Add .access to CURRENT level
            // e.g. system.settings.access
            derivedPerms.add(`${currentPath}.access`);

            currentPath += `.${parts[i]}`;
        }
    });

    return Array.from(derivedPerms);
}
