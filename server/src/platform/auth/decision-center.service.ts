import { Injectable } from '@nestjs/common';

@Injectable()
export class DecisionCenterService {
    /**
     * EVALUATE ACCESS - SINGLE TRUTH
     * Returns TRUE if user has AT LEAST ONE of the required permissions.
     * Enforces STRICT EXACT MATCH logic (handled by the caller's permission set, 
     * but here we ensure simple string equality).
     */
    isAllowed(userPermissions: string[], requiredPermissions: string[]): boolean {
        // Default: Allow if no permissions required? 
        // Logic: Guard usually checks this. If we get here, restrictions exist.
        if (!requiredPermissions || requiredPermissions.length === 0) return true;

        // No user permissions = DENY
        if (!userPermissions || userPermissions.length === 0) return false;

        // Check intersection
        return requiredPermissions.some(required => userPermissions.includes(required));
    }

    /**
     * Strict Evaluation (AND logic) - Future Proofing
     */
    isAllowedStrict(userPermissions: string[], requiredPermissions: string[]): boolean {
        if (!requiredPermissions || requiredPermissions.length === 0) return true;
        if (!userPermissions || userPermissions.length === 0) return false;

        return requiredPermissions.every(required => userPermissions.includes(required));
    }
}
