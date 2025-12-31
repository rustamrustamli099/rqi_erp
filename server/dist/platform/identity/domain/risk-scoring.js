"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRiskScore = calculateRiskScore;
exports.requiresApproval = requiresApproval;
const PERMISSION_WEIGHTS = [
    { pattern: '*.approve', weight: 18, category: 'APPROVAL', reason: 'Approval permissions are high-risk' },
    { pattern: '*.delete', weight: 15, category: 'DESTRUCTIVE', reason: 'Delete permissions can cause data loss' },
    { pattern: 'system.roles.*', weight: 16, category: 'IAM', reason: 'Role management affects system security' },
    { pattern: 'system.permissions.*', weight: 18, category: 'IAM', reason: 'Permission management is critical' },
    { pattern: 'system.users.impersonate', weight: 20, category: 'SECURITY', reason: 'Impersonation is extremely sensitive' },
    { pattern: 'system.audit.delete', weight: 20, category: 'SECURITY', reason: 'Audit log deletion is critical security risk' },
    { pattern: '*.export', weight: 12, category: 'DATA', reason: 'Export permissions enable data exfiltration' },
    { pattern: 'system.billing.*', weight: 14, category: 'FINANCE', reason: 'Billing actions affect financial operations' },
    { pattern: 'system.users.create', weight: 10, category: 'IAM', reason: 'User creation affects access control' },
    { pattern: 'system.settings.security.*', weight: 14, category: 'SECURITY', reason: 'Security settings are sensitive' },
    { pattern: '*.update', weight: 6, category: 'WRITE', reason: 'Update permissions modify data' },
    { pattern: '*.create', weight: 5, category: 'WRITE', reason: 'Create permissions add new data' },
    { pattern: 'system.settings.*', weight: 8, category: 'CONFIG', reason: 'Settings affect system behavior' },
    { pattern: '*.read', weight: 2, category: 'READ', reason: 'Read-only access' },
    { pattern: '*.view', weight: 2, category: 'READ', reason: 'View-only access' },
];
function calculateRiskScore(permissions, hasSodConflicts = false) {
    const reasons = [];
    let totalWeight = 0;
    for (const permission of permissions) {
        const weight = getPermissionWeight(permission);
        if (weight) {
            totalWeight += weight.weight;
            reasons.push({
                code: weight.category,
                description: weight.reason,
                weight: weight.weight
            });
        }
    }
    if (hasSodConflicts) {
        totalWeight += 30;
        reasons.push({
            code: 'SOD_CONFLICT',
            description: 'Role has Segregation of Duties conflicts',
            weight: 30
        });
    }
    const hasAdminPerms = permissions.some(p => p.startsWith('system.') || p.startsWith('platform.'));
    if (hasAdminPerms) {
        totalWeight += 10;
        reasons.push({
            code: 'ADMIN_SCOPE',
            description: 'Role has system/platform level permissions',
            weight: 10
        });
    }
    const score = Math.min(totalWeight, 100);
    const level = scoreToLevel(score);
    const uniqueReasons = deduplicateReasons(reasons).slice(0, 5);
    return { score, level, reasons: uniqueReasons };
}
function getPermissionWeight(permission) {
    for (const weight of PERMISSION_WEIGHTS) {
        if (matchesPattern(permission, weight.pattern)) {
            return weight;
        }
    }
    return null;
}
function matchesPattern(permission, pattern) {
    if (pattern === permission)
        return true;
    if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        return regex.test(permission);
    }
    return false;
}
function scoreToLevel(score) {
    if (score <= 30)
        return 'LOW';
    if (score <= 70)
        return 'MEDIUM';
    return 'HIGH';
}
function deduplicateReasons(reasons) {
    const seen = new Map();
    for (const reason of reasons) {
        const existing = seen.get(reason.code);
        if (!existing || reason.weight > existing.weight) {
            seen.set(reason.code, reason);
        }
    }
    return Array.from(seen.values()).sort((a, b) => b.weight - a.weight);
}
function requiresApproval(riskScore) {
    return riskScore.level === 'HIGH';
}
//# sourceMappingURL=risk-scoring.js.map