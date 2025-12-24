
export interface Role {
    id: string;
    name: string;
    description?: string;
    scope: 'SYSTEM' | 'TENANT';
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'PENDING_APPROVAL';
    permissions: string[];
    isLocked?: boolean;
}
