import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionDryRunEngine {
    /**
     * Evaluates access based on user permissions and required permissions.
     * Logic: Returns TRUE if user has AT LEAST ONE of the required permissions (OR logic).
     * This matches the application's standard guard behavior.
     */
    static evaluate(userPermissions: string[], requiredPermissions: string[]): { allowed: boolean } {
        if (!requiredPermissions || requiredPermissions.length === 0) return { allowed: true };
        if (!userPermissions || userPermissions.length === 0) return { allowed: false };

        const hasPermission = requiredPermissions.some(permission => userPermissions.includes(permission));
        return { allowed: hasPermission };
    }

    /**
     * Strict Evaluation (AND logic) - for future use if needed.
     */
    static evaluateStrict(userPermissions: string[], requiredPermissions: string[]): { allowed: boolean, missing: string[] } {
        const missing = requiredPermissions.filter(p => !userPermissions.includes(p));
        return {
            allowed: missing.length === 0,
            missing
        };
    }
}
