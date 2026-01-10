/**
 * Segregation of Duties (SoD) Rules Registry
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bank-Grade SoD Engine - SAP / Oracle / Core Banking standards.
 * 
 * RULE: A single user MUST NOT have both permissions in a conflict pair.
 * 
 * Risk Levels:
 * - CRITICAL: Block save entirely
 * - HIGH: Allow save but require extra approval
 * - MEDIUM: Warning only
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type SoDRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface SoDRule {
    id: string;
    name: string;
    description: string;
    descriptionAz: string;
    riskLevel: SoDRiskLevel;
    permissions: [string, string]; // Conflict pair
    recommendation: string;
    recommendationAz: string;
    complianceRefs: string[]; // SOC2/ISO references
}

export interface SoDConflict {
    rule: SoDRule;
    foundPermissions: string[];
    roleId?: string;
    userId?: string;
}

export interface SoDValidationResult {
    isValid: boolean;
    conflicts: SoDConflict[];
    criticalCount: number;
    highCount: number;
    mediumCount: number;
}

/**
 * Bank-Grade SoD Rules Registry
 * Based on SAP GRC / Oracle Access Controls best practices
 */
export const SOD_RULES: SoDRule[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // ROLE MANAGEMENT CONFLICTS
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'SOD-ROLE-001',
        name: 'Role Create + Approve',
        description: 'User cannot both create and approve roles',
        descriptionAz: 'İstifadəçi həm rol yarada, həm də təsdiq edə bilməz',
        riskLevel: 'CRITICAL',
        permissions: ['system.roles.create', 'system.roles.approve'],
        recommendation: 'Separate these responsibilities to different users',
        recommendationAz: 'Bu səlahiyyətləri fərqli istifadəçilərə ayırın',
        complianceRefs: ['SOC2-CC6.1', 'ISO27001-A.9.2.3']
    },
    {
        id: 'SOD-ROLE-002',
        name: 'Role Update + Approve',
        description: 'User cannot both update and approve role changes',
        descriptionAz: 'İstifadəçi həm rol dəyişə, həm də təsdiq edə bilməz',
        riskLevel: 'CRITICAL',
        permissions: ['system.roles.update', 'system.roles.approve'],
        recommendation: 'Implement 4-eyes principle for role changes',
        recommendationAz: 'Rol dəyişiklikləri üçün 4-göz prinsipini tətbiq edin',
        complianceRefs: ['SOC2-CC6.1', 'ISO27001-A.9.2.3']
    },
    {
        id: 'SOD-ROLE-003',
        name: 'Role Delete + Approve',
        description: 'User cannot both delete and approve role deletions',
        descriptionAz: 'İstifadəçi həm rol silə, həm də silməni təsdiq edə bilməz',
        riskLevel: 'CRITICAL',
        permissions: ['system.roles.delete', 'system.roles.approve'],
        recommendation: 'Critical deletions require independent approval',
        recommendationAz: 'Kritik silmələr müstəqil təsdiq tələb edir',
        complianceRefs: ['SOC2-CC6.1', 'ISO27001-A.9.2.3']
    },

    // ═══════════════════════════════════════════════════════════════════════
    // USER ACCESS CONFLICTS
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'SOD-USER-001',
        name: 'User Create + Approve',
        description: 'User cannot both create users and approve user creation',
        descriptionAz: 'İstifadəçi həm yeni user yarada, həm də təsdiq edə bilməz',
        riskLevel: 'CRITICAL',
        permissions: ['system.users.create', 'system.users.approve'],
        recommendation: 'Separate user provisioning from approval',
        recommendationAz: 'User yaradılmasını təsdiqdən ayırın',
        complianceRefs: ['SOC2-CC6.2', 'ISO27001-A.9.2.1']
    },
    {
        id: 'SOD-USER-002',
        name: 'User Role Assignment + Role Approve',
        description: 'User cannot both assign roles and approve role changes',
        descriptionAz: 'İstifadəçi həm rol təyin edə, həm də rol dəyişikliklərini təsdiq edə bilməz',
        riskLevel: 'HIGH',
        permissions: ['system.users.assign_role', 'system.roles.approve'],
        recommendation: 'Role assignment should be reviewed by different person',
        recommendationAz: 'Rol təyinatı fərqli şəxs tərəfindən yoxlanılmalıdır',
        complianceRefs: ['SOC2-CC6.2', 'ISO27001-A.9.2.2']
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BILLING / FINANCE CONFLICTS
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'SOD-BILLING-001',
        name: 'Invoice Create + Approve',
        description: 'User cannot both create and approve invoices',
        descriptionAz: 'İstifadəçi həm faktura yarada, həm də təsdiq edə bilməz',
        riskLevel: 'CRITICAL',
        permissions: ['system.billing.invoice.create', 'system.billing.invoice.approve'],
        recommendation: 'Financial transactions require independent approval',
        recommendationAz: 'Maliyyə əməliyyatları müstəqil təsdiq tələb edir',
        complianceRefs: ['SOC2-CC6.3', 'ISO27001-A.9.4.1']
    },
    {
        id: 'SOD-BILLING-002',
        name: 'Payment Execute + Approve',
        description: 'User cannot both execute and approve payments',
        descriptionAz: 'İstifadəçi həm ödəniş edə, həm də təsdiq edə bilməz',
        riskLevel: 'CRITICAL',
        permissions: ['system.billing.payment.execute', 'system.billing.payment.approve'],
        recommendation: 'Payment execution requires separate approval',
        recommendationAz: 'Ödəniş icrası ayrıca təsdiq tələb edir',
        complianceRefs: ['SOC2-CC6.3', 'ISO27001-A.9.4.1']
    },
    {
        id: 'SOD-BILLING-003',
        name: 'Refund Create + Approve',
        description: 'User cannot both create and approve refunds',
        descriptionAz: 'İstifadəçi həm geri ödəmə yarada, həm də təsdiq edə bilməz',
        riskLevel: 'CRITICAL',
        permissions: ['system.billing.refund.create', 'system.billing.refund.approve'],
        recommendation: 'Refunds are high-risk and require independent approval',
        recommendationAz: 'Geri ödəmələr yüksək risklidir və müstəqil təsdiq tələb edir',
        complianceRefs: ['SOC2-CC6.3', 'ISO27001-A.9.4.1']
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SECURITY CONFLICTS
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'SOD-SEC-001',
        name: 'Permission Assign + Audit Delete',
        description: 'User cannot both assign permissions and delete audit logs',
        descriptionAz: 'İstifadəçi həm icazə təyin edə, həm də audit loglarını silə bilməz',
        riskLevel: 'CRITICAL',
        permissions: ['system.permissions.assign', 'system.audit.logs.delete'],
        recommendation: 'Audit log integrity must be protected',
        recommendationAz: 'Audit log bütövlüyü qorunmalıdır',
        complianceRefs: ['SOC2-CC7.2', 'ISO27001-A.12.4.2']
    },
    {
        id: 'SOD-SEC-002',
        name: 'Impersonate + Role Manage',
        description: 'User cannot both impersonate users and manage roles',
        descriptionAz: 'İstifadəçi həm digər user kimi girə, həm də rol idarə edə bilməz',
        riskLevel: 'CRITICAL',
        permissions: ['system.users.impersonate', 'system.roles.update'],
        recommendation: 'Impersonation with role management is extremely dangerous',
        recommendationAz: 'Rol idarəetməsi ilə impersonation çox təhlükəlidir',
        complianceRefs: ['SOC2-CC6.1', 'ISO27001-A.9.4.2']
    },

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT / DATA CONFLICTS
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'SOD-EXPORT-001',
        name: 'Data Export + Export Approve',
        description: 'User cannot both export data and approve exports',
        descriptionAz: 'İstifadəçi həm data export edə, həm də export təsdiq edə bilməz',
        riskLevel: 'HIGH',
        permissions: ['system.data.export', 'system.export.approve'],
        recommendation: 'High-risk exports require independent approval',
        recommendationAz: 'Yüksək riskli exportlar müstəqil təsdiq tələb edir',
        complianceRefs: ['SOC2-CC8.1', 'ISO27001-A.8.3.1']
    },
    {
        id: 'SOD-EXPORT-002',
        name: 'Audit Export + Audit Modify',
        description: 'User cannot both export and modify audit logs',
        descriptionAz: 'İstifadəçi həm audit export edə, həm də audit dəyişdirə bilməz',
        riskLevel: 'CRITICAL',
        permissions: ['system.audit.export', 'system.audit.update'],
        recommendation: 'Audit log export should be read-only operation',
        recommendationAz: 'Audit log export yalnız oxuma əməliyyatı olmalıdır',
        complianceRefs: ['SOC2-CC7.2', 'ISO27001-A.12.4.3']
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MEDIUM RISK - WARNINGS ONLY
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'SOD-WARN-001',
        name: 'User Create + User Delete',
        description: 'Same user can both create and delete users',
        descriptionAz: 'Eyni istifadəçi həm user yarada, həm də silə bilər',
        riskLevel: 'MEDIUM',
        permissions: ['system.users.create', 'system.users.delete'],
        recommendation: 'Consider separating create and delete permissions',
        recommendationAz: 'Yaratma və silmə icazələrini ayırmağı düşünün',
        complianceRefs: ['SOC2-CC6.2']
    },
    {
        id: 'SOD-WARN-002',
        name: 'Settings Update + Settings Export',
        description: 'Same user can both update and export settings',
        descriptionAz: 'Eyni istifadəçi həm ayarları dəyişə, həm də export edə bilər',
        riskLevel: 'MEDIUM',
        permissions: ['system.settings.update', 'system.settings.export'],
        recommendation: 'Monitor this combination for suspicious activity',
        recommendationAz: 'Bu kombinasiyanı şübhəli fəaliyyətə görə izləyin',
        complianceRefs: ['SOC2-CC8.1']
    }
];

/**
 * SoD Validation Service
 * Checks a set of permissions for SoD conflicts
 */
export class SoDValidationService {
    /**
     * Validate permissions against SoD rules
     */
    static validate(permissions: string[]): SoDValidationResult {
        const conflicts: SoDConflict[] = [];
        const permissionSet = new Set(permissions);

        for (const rule of SOD_RULES) {
            const [perm1, perm2] = rule.permissions;

            // Check if user has both conflicting permissions
            const hasPerm1 = this.hasPermission(permissionSet, perm1);
            const hasPerm2 = this.hasPermission(permissionSet, perm2);

            if (hasPerm1 && hasPerm2) {
                conflicts.push({
                    rule,
                    foundPermissions: [perm1, perm2]
                });
            }
        }

        // Count by risk level
        const criticalCount = conflicts.filter(c => c.rule.riskLevel === 'CRITICAL').length;
        const highCount = conflicts.filter(c => c.rule.riskLevel === 'HIGH').length;
        const mediumCount = conflicts.filter(c => c.rule.riskLevel === 'MEDIUM').length;

        return {
            isValid: criticalCount === 0, // Block only on CRITICAL
            conflicts,
            criticalCount,
            highCount,
            mediumCount
        };
    }

    /**
     * Check if permission set contains a permission (with prefix matching)
     */
    private static hasPermission(permissionSet: Set<string>, required: string): boolean {
        // PER SAP PFCG CONSTITUTION: EXACT MATCH ONLY.
        // No prefix matching, no wildcards, no inference.
        return permissionSet.has(required);
    }

    /**
     * Get human-readable summary
     */
    static getSummary(result: SoDValidationResult): string {
        if (result.conflicts.length === 0) {
            return 'No SoD conflicts detected';
        }

        const parts: string[] = [];
        if (result.criticalCount > 0) parts.push(`${result.criticalCount} CRITICAL`);
        if (result.highCount > 0) parts.push(`${result.highCount} HIGH`);
        if (result.mediumCount > 0) parts.push(`${result.mediumCount} MEDIUM`);

        return `SoD Conflicts: ${parts.join(', ')}`;
    }

    /**
     * Get rule by ID
     */
    static getRule(ruleId: string): SoDRule | undefined {
        return SOD_RULES.find(r => r.id === ruleId);
    }

    /**
     * Get all rules by risk level
     */
    static getRulesByLevel(level: SoDRiskLevel): SoDRule[] {
        return SOD_RULES.filter(r => r.riskLevel === level);
    }
}

export default SoDValidationService;
