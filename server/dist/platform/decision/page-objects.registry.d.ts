export interface PageSection {
    key: string;
    requiredPermissions: string[];
}
export interface PageAuthorizationObject {
    pageKey: string;
    entityKey: string;
    readPermission: string;
    sections?: PageSection[];
}
export declare const PAGE_OBJECTS_REGISTRY: PageAuthorizationObject[];
export declare function getPageObject(pageKey: string): PageAuthorizationObject | undefined;
