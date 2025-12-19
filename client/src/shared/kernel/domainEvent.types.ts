/**
 * Registry of all Domain Events in the system.
 * Use this to ensure type safety when publishing/subscribing.
 */

// Finance Domain
export interface FinanceInvoicePaidEvent {
    invoiceId: string;
    amount: number;
    currency: string;
    timestamp: string;
}

// Tenant Domain
export interface TenantStatusEvent {
    tenantId: string;
    status: 'ACTIVE' | 'SUSPENDED';
    updatedBy: string;
}

// System Domain
export interface SystemUserCreatedEvent {
    userId: string;
    email: string;
    role: string;
}

// Map Event Name to Payload Type
export interface DomainEventMap {
    'finance:invoice_paid': FinanceInvoicePaidEvent;
    'finance:payment_failed': { invoiceId: string; reason: string };
    'tenant:status_changed': TenantStatusEvent;
    'system:user_created': SystemUserCreatedEvent;
}
