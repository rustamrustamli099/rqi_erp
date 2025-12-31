export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export interface RiskScore {
    score: number;
    level: RiskLevel;
    reasons: RiskReason[];
}
export interface RiskReason {
    code: string;
    description: string;
    weight: number;
}
export declare function calculateRiskScore(permissions: string[], hasSodConflicts?: boolean): RiskScore;
export declare function requiresApproval(riskScore: RiskScore): boolean;
