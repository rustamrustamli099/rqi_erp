/**
 * Risk Scoring Engine
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bank-Grade Risk Scoring - SAP / Oracle / Core Banking standards.
 * 
 * Every role and action gets a risk score (0-100):
 * - 0-30: LOW (🟢)
 * - 31-70: MEDIUM (🟠)
 * - 71-100: HIGH (🔴)
 * 
 * HIGH risk actions require 4-eyes approval.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskScore {
    score: number;
    level: RiskLevel;
    reasons: RiskReason[];
}

export interface RiskReason {
    code: string;
    description: string;
    descriptionAz: string;
    weight: number;
    category: 'PERMISSION' | 'SOD' | 'SCOPE' | 'ACTION' | 'DATA';
}

export interface PermissionWeight {
    pattern: string; // Permission pattern (supports * wildcard)
    weight: number;  // Risk weight (1-20)
    category: string;
    reason: string;
    reasonAz: string;
}

/**
 * Permission Weight Configuration
 * Higher weight = Higher risk
 */
export const PERMISSION_WEIGHTS: PermissionWeight[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // CRITICAL PERMISSIONS (Weight 15-20)
    // ═══════════════════════════════════════════════════════════════════════
    {
        pattern: 'system.roles.approve',
        weight: 18,
        category: 'APPROVAL',
        reason: 'Approval permissions are high-risk',
        reasonAz: 'Təsdiq icazələri yüksək risklidir'
    },
    {
        pattern: 'system.roles.delete',
        weight: 16,
        category: 'IAM',
        reason: 'Role deletion affects system security',
        reasonAz: 'Rol silinməsi sistem təhlükəsizliyinə təsir edir'
    },
    {
        pattern: 'system.users.impersonate',
        weight: 20,
        category: 'SECURITY',
        reason: 'Impersonation is extremely sensitive',
        reasonAz: 'İmpersonation çox həssasdır'
    },
    {
        pattern: 'system.audit.delete',
        weight: 20,
        category: 'SECURITY',
        reason: 'Audit log deletion is critical security risk',
        reasonAz: 'Audit log silməsi kritik təhlükəsizlik riskidir'
    },

    // ═══════════════════════════════════════════════════════════════════════
    // HIGH-RISK PERMISSIONS (Weight 10-14)
    // ═══════════════════════════════════════════════════════════════════════
    {
        pattern: 'system.data.export',
        weight: 12,
        category: 'DATA',
        reason: 'Export permissions enable data exfiltration',
        reasonAz: 'Export icazələri data çıxarışına imkan verir'
    },
    {
        pattern: 'system.billing.payment.execute',
        weight: 14,
        category: 'FINANCE',
        reason: 'Executing payments is high risk',
        reasonAz: 'Ödəniş icrası yüksək risklidir'
    },
    {
        pattern: 'system.users.create',
        weight: 10,
        category: 'IAM',
        reason: 'User creation affects access control',
        reasonAz: 'User yaradılması giriş nəzarətinə təsir edir'
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MEDIUM-RISK PERMISSIONS (Weight 5-9)
    // ═══════════════════════════════════════════════════════════════════════
    {
        pattern: 'system.branches.delete',
        weight: 8,
        category: 'DESTRUCTIVE',
        reason: 'Deleting branches is destructive',
        reasonAz: 'Filial silinməsi destruktivdir'
    },
    {
        pattern: 'system.settings.update',
        weight: 8,
        category: 'CONFIG',
        reason: 'Settings affect system behavior',
        reasonAz: 'Ayarlar sistem davranışına təsir edir'
    },
    // Add more explicit permissions as needed...

    // ═══════════════════════════════════════════════════════════════════════
    // LOW-RISK PERMISSIONS (Weight 1-4)
    // ═══════════════════════════════════════════════════════════════════════
    // [REMOVED WILDCARDS FOR SAP PFCG COMPLIANCE]
    // Exact matches only.
];

/**
 * Risk Scoring Service
 */
export class RiskScoringService {
    private static readonly MAX_SCORE = 100;

    /**
     * Calculate risk score for a set of permissions
     */
    static calculateScore(permissions: string[], hasSodConflicts: boolean = false): RiskScore {
        const reasons: RiskReason[] = [];
        let totalWeight = 0;

        // Calculate permission weights
        for (const permission of permissions) {
            const weight = this.getPermissionWeight(permission);
            if (weight) {
                totalWeight += weight.weight;
                reasons.push({
                    code: weight.category,
                    description: weight.reason,
                    descriptionAz: weight.reasonAz,
                    weight: weight.weight,
                    category: 'PERMISSION'
                });
            }
        }

        // Add SoD conflict penalty
        if (hasSodConflicts) {
            const sodPenalty = 30;
            totalWeight += sodPenalty;
            reasons.push({
                code: 'SOD_CONFLICT',
                description: 'Role has Segregation of Duties conflicts',
                descriptionAz: 'Rol SoD konfliktləri ehtiva edir',
                weight: sodPenalty,
                category: 'SOD'
            });
        }

        // Check for admin scope - EXACT MATCH ONLY for known roots, or removed if strict.
        // For SAP PFCG compliance, we avoid broad 'startsWith' if possible.
        // However, for pure analytics (not auth) this might be acceptable, but we'll remove it to be 100% safe.
        // [REMOVED PREFIX CHECK]

        // Normalize score to 0-100
        const score = Math.min(totalWeight, this.MAX_SCORE);
        const level = this.scoreToLevel(score);

        // Remove duplicates and sort by weight descending
        const uniqueReasons = this.deduplicateReasons(reasons);

        return {
            score,
            level,
            reasons: uniqueReasons.slice(0, 5) // Top 5 reasons
        };
    }

    /**
     * Get weight for a specific permission
     */
    private static getPermissionWeight(permission: string): PermissionWeight | null {
        // Try exact match first
        for (const weight of PERMISSION_WEIGHTS) {
            if (weight.pattern === permission) {
                return weight;
            }
        }
        return null;
    }

    // [REMOVED matchesPattern method - Wildcards forbidden]

    /**
     * Convert score to risk level
     */
    private static scoreToLevel(score: number): RiskLevel {
        if (score <= 30) return 'LOW';
        if (score <= 70) return 'MEDIUM';
        return 'HIGH';
    }

    /**
     * Remove duplicate reasons
     */
    private static deduplicateReasons(reasons: RiskReason[]): RiskReason[] {
        const seen = new Map<string, RiskReason>();

        for (const reason of reasons) {
            const key = reason.code;
            const existing = seen.get(key);

            if (!existing || reason.weight > existing.weight) {
                seen.set(key, reason);
            }
        }

        return Array.from(seen.values()).sort((a, b) => b.weight - a.weight);
    }

    /**
     * Get risk level color
     */
    static getLevelColor(level: RiskLevel): string {
        switch (level) {
            case 'LOW': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
            case 'MEDIUM': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
            case 'HIGH': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
        }
    }

    /**
     * Get risk level emoji
     */
    static getLevelEmoji(level: RiskLevel): string {
        switch (level) {
            case 'LOW': return '🟢';
            case 'MEDIUM': return '🟠';
            case 'HIGH': return '🔴';
        }
    }

    /**
     * Check if approval is required
     */
    static requiresApproval(riskScore: RiskScore): boolean {
        return riskScore.level === 'HIGH';
    }
}

export default RiskScoringService;
