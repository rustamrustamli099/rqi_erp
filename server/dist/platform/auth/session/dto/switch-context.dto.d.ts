export declare enum ScopeType {
    SYSTEM = "SYSTEM",
    TENANT = "TENANT",
    UNIT = "UNIT"
}
export declare class SwitchContextDto {
    scopeType: ScopeType;
    scopeId?: string | null;
}
