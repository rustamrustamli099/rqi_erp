export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
    raw?: any;
}
export interface PaymentStrategy {
    name: string;
    initiatePayment(amount: number, currency: string, metadata: any): Promise<any>;
    verifyPayment(transactionId: string): Promise<PaymentResult>;
    handleWebhook(event: any): Promise<void>;
}
