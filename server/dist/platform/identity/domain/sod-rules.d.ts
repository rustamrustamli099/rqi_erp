export type SoDRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM';
export interface SoDRule {
    id: string;
    name: string;
    description: string;
    riskLevel: SoDRiskLevel;
    permissions: [string, string];
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
export declare const SOD_RULES: SoDRule[];
export declare function validateSoD(permissions: string[]): SoDValidationResult;
