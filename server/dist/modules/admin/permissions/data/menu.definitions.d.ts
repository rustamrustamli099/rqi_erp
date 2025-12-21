export interface MenuItem {
    id: string;
    label: string;
    path?: string;
    requiredPermissions?: string[];
    children?: MenuItem[];
}
export declare const PLATFORM_MENU_DEF: MenuItem[];
export declare const TENANT_MENU_DEF: MenuItem[];
