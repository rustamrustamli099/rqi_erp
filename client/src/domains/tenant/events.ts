export const TENANT_EVENTS = {
    TENANT_CREATED: 'tenant:created',
    TENANT_STATUS_CHANGED: 'tenant:status_changed',
} as const;

export interface TenantStatusPayload {
    tenantId: string;
    status: 'ACTIVE' | 'SUSPENDED';
    updatedBy: string;
}
