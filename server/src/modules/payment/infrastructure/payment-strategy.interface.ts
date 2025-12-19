export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
    raw?: any;
}

export interface PaymentStrategy {
    name: string;

    /**
     * Initiates a payment transaction.
     * Returns a client secret (for Stripe) or redirect URL.
     */
    initiatePayment(amount: number, currency: string, metadata: any): Promise<any>;

    /**
     * Verifies a completed transaction.
     */
    verifyPayment(transactionId: string): Promise<PaymentResult>;

    /**
     * Handles webhook events from the provider.
     */
    handleWebhook(event: any): Promise<void>;
}
