export declare class CreateRoleDto {
    name: string;
    description?: string;
    scope: 'SYSTEM' | 'TENANT';
    permissionIds?: string[];
}
