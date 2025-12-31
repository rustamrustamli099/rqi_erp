/**
 * Segregation of Duties (SoD) Rules
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bank-Grade SoD Engine - SAP / Oracle / Core Banking standards.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type SoDRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface SoDRule {
    id: string;
    name: string;
    description: string;
    riskLevel: SoDRiskLevel;
    permissions: [string, string]; // Conflict pair
    recommendation: string;
    complianceRefs: string[];
}

export interface SoDConflict {
    rule: SoDRule;
    foundPermissions: string[];
}

export interface SoDValidationResult {
    isValid: boolean;
    conflicts: SoDConflict[];
    criticalCount: number;
    highCount: number;
    mediumCount: number;
}

/**
 * Bank-Grade SoD Rules
 */
export const SOD_RULES: SoDRule[] = [
    // Role Management
    {
        id: 'SOD-ROLE-001',
        name: 'Role Create + Approve',
        description: 'User cannot both create and approve roles',
        riskLevel: 'CRITICAL',
        permissions: ['system.roles.create', 'system.roles.approve'],
        recommendation: 'Separate these responsibilities to different users',
        complianceRefs: ['SOC2-CC6.1', 'ISO27001-A.9.2.3']
    },
    {
        id: 'SOD-ROLE-002',
        name: 'Role Update + Approve',
        description: 'User cannot both update and approve role changes',
        riskLevel: 'CRITICAL',
        permissions: ['system.roles.update', 'system.roles.approve'],
        recommendation: 'Implement 4-eyes principle for role changes',
        complianceRefs: ['SOC2-CC6.1', 'ISO27001-A.9.2.3']
    },
    {
        id: 'SOD-ROLE-003',
        name: 'Role Delete + Approve',
        description: 'User cannot both delete and approve role deletions',
        riskLevel: 'CRITICAL',
        permissions: ['system.roles.delete', 'system.roles.approve'],
        recommendation: 'Critical deletions require independent approval',
        complianceRefs: ['SOC2-CC6.1', 'ISO27001-A.9.2.3']
    },
    // User Access
    {
        id: 'SOD-USER-001',
        name: 'User Create + Approve',
        description: 'User cannot both create users and approve user creation',
        riskLevel: 'CRITICAL',
        permissions: ['system.users.create', 'system.users.approve'],
        recommendation: 'Separate user provisioning from approval',
        complianceRefs: ['SOC2-CC6.2', 'ISO27001-A.9.2.1']
    },
    // Billing
    {
        id: 'SOD-BILLING-001',
        name: 'Invoice Create + Approve',
        description: 'User cannot both create and approve invoices',
        riskLevel: 'CRITICAL',
        permissions: ['system.billing.invoice.create', 'system.billing.invoice.approve'],
        recommendation: 'Financial transactions require independent approval',
        complianceRefs: ['SOC2-CC6.3', 'ISO27001-A.9.4.1']
    },
    // Security
    {
        id: 'SOD-SEC-001',
        name: 'Permission Assign + Audit Delete',
        description: 'User cannot both assign permissions and delete audit logs',
        riskLevel: 'CRITICAL',
        permissions: ['system.permissions.assign', 'system.audit.logs.delete'],
        recommendation: 'Audit log integrity must be protected',
        complianceRefs: ['SOC2-CC7.2', 'ISO27001-A.12.4.2']
    },
    {
        id: 'SOD-SEC-002',
        name: 'Impersonate + Role Manage',
        description: 'User cannot both impersonate users and manage roles',
        riskLevel: 'CRITICAL',
        permissions: ['system.users.impersonate', 'system.roles.update'],
        recommendation: 'Impersonation with role management is extremely dangerous',
        complianceRefs: ['SOC2-CC6.1', 'ISO27001-A.9.4.2']
    },
    // Export
    {
        id: 'SOD-EXPORT-001',
        name: 'Data Export + Export Approve',
        description: 'User cannot both export data and approve exports',
        riskLevel: 'HIGH',
        permissions: ['system.data.export', 'system.export.approve'],
        recommendation: 'High-risk exports require independent approval',
        complianceRefs: ['SOC2-CC8.1', 'ISO27001-A.8.3.1']
    },
];

/**
 * Validate permissions against SoD rules
 */
export function validateSoD(permissions: string[]): SoDValidationResult {
    const conflicts: SoDConflict[] = [];
    const permissionSet = new Set(permissions);

    for (const rule of SOD_RULES) {
        const [perm1, perm2] = rule.permissions;

        const hasPerm1 = hasPermission(permissionSet, perm1);
        const hasPerm2 = hasPermission(permissionSet, perm2);

        if (hasPerm1 && hasPerm2) {
            conflicts.push({
                rule,
                foundPermissions: [perm1, perm2]
            });
        }
    }

    const criticalCount = conflicts.filter(c => c.rule.riskLevel === 'CRITICAL').length;
    const highCount = conflicts.filter(c => c.rule.riskLevel === 'HIGH').length;
    const mediumCount = conflicts.filter(c => c.rule.riskLevel === 'MEDIUM').length;

    return {
        isValid: criticalCount === 0,
        conflicts,
        criticalCount,
        highCount,
        mediumCount
    };
}

function hasPermission(permissionSet: Set<string>, required: string): boolean {
    if (permissionSet.has(required)) return true;

    for (const perm of permissionSet) {
        if (required.startsWith(perm + '.') || perm.startsWith(required + '.')) {
            return true;
        }
    }

    return false;
}
