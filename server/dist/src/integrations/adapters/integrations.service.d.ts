import { OnModuleInit } from '@nestjs/common';
export interface SmsConfig {
    provider: 'twilio' | 'koneko' | 'vipex';
    apiKey: string;
    senderId: string;
    enabled: boolean;
}
export interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    enabled: boolean;
}
export interface TotpConfig {
    issuer: string;
    algo: 'SHA1' | 'SHA256';
    enforce: boolean;
}
export declare class IntegrationsService implements OnModuleInit {
    private readonly dataPath;
    private readonly dataDir;
    private config;
    onModuleInit(): void;
    private ensureDataDir;
    private loadConfig;
    private saveConfig;
    getSmsConfig(): SmsConfig;
    saveSmsConfig(data: Partial<SmsConfig>): SmsConfig;
    sendTestSms(phone: string): Promise<{
        success: boolean;
        provider: "twilio" | "koneko" | "vipex";
    }>;
    getSmtpConfig(): SmtpConfig;
    saveSmtpConfig(data: Partial<SmtpConfig>): SmtpConfig;
    sendTestEmail(email: string): Promise<{
        success: boolean;
    }>;
    getTotpConfig(): TotpConfig;
    saveTotpConfig(data: Partial<TotpConfig>): TotpConfig;
}
