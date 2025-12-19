export const FINANCE_EVENTS = {
    INVOICE_PAID: 'finance:invoice_paid',
    PAYMENT_FAILED: 'finance:payment_failed',
} as const;

export interface InvoicePaidPayload {
    invoiceId: string;
    amount: number;
    currency: string;
    timestamp: string;
}

export interface PaymentFailedPayload {
    invoiceId: string;
    reason: string;
}
