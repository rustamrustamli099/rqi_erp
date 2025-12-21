import { IntegrationsService, SmsConfig, SmtpConfig, TotpConfig } from './integrations.service';
export declare class IntegrationsController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    getSms(): SmsConfig;
    saveSms(body: Partial<SmsConfig>): SmsConfig;
    testSms(phone: string): Promise<{
        success: boolean;
        provider: "twilio" | "koneko" | "vipex";
    }>;
    getSmtp(): SmtpConfig;
    saveSmtp(body: Partial<SmtpConfig>): SmtpConfig;
    testSmtp(email: string): Promise<{
        success: boolean;
    }>;
    getTotp(): TotpConfig;
    saveTotp(body: Partial<TotpConfig>): TotpConfig;
}
