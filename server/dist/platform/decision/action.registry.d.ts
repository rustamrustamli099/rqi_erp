export interface ActionPermissionDef {
    actionKey: string;
    permissionSlug: string;
}
export interface EntityActionConfig {
    entityKey: string;
    scope: 'system' | 'tenant';
    actions: ActionPermissionDef[];
}
export declare const ACTION_PERMISSIONS_REGISTRY: EntityActionConfig[];
