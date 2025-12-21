export declare class PermissionDryRunEngine {
    static evaluate(userPermissions: string[], requiredPermissions: string[]): {
        allowed: boolean;
    };
    static evaluateStrict(userPermissions: string[], requiredPermissions: string[]): {
        allowed: boolean;
        missing: string[];
    };
}
