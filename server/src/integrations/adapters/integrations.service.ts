
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Types mimicking what the Frontend expects
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

interface IntegrationsData {
    sms: SmsConfig;
    smtp: SmtpConfig;
    totp: TotpConfig;
}

@Injectable()
export class IntegrationsService implements OnModuleInit {
    private readonly dataPath = path.join(process.cwd(), 'data', 'integrations.json');
    private readonly dataDir = path.join(process.cwd(), 'data');

    private config: IntegrationsData = {
        sms: { provider: 'twilio', apiKey: '', senderId: '', enabled: false },
        smtp: { host: '', port: 587, user: '', pass: '', secure: true, enabled: false },
        totp: { issuer: 'RQI ERP', algo: 'SHA1', enforce: false },
    };

    onModuleInit() {
        this.ensureDataDir();
        this.loadConfig();
    }

    private ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    private loadConfig() {
        if (fs.existsSync(this.dataPath)) {
            try {
                const raw = fs.readFileSync(this.dataPath, 'utf-8');
                const loaded = JSON.parse(raw);
                this.config = { ...this.config, ...loaded };
            } catch (e) {
                console.error('Failed to load integrations.json, using defaults', e);
            }
        } else {
            this.saveConfig();
        }
    }

    private saveConfig() {
        try {
            fs.writeFileSync(this.dataPath, JSON.stringify(this.config, null, 2));
        } catch (e) {
            console.error('Failed to save integrations.json', e);
        }
    }

    // SMS
    getSmsConfig() { return this.config.sms; }
    saveSmsConfig(data: Partial<SmsConfig>) {
        this.config.sms = { ...this.config.sms, ...data };
        this.saveConfig();
        return this.config.sms;
    }

    async sendTestSms(phone: string) {
        if (!this.config.sms.enabled) throw new Error("SMS Integration disabled");
        // Mock sending
        console.log(`[Integration] Sending SMS via ${this.config.sms.provider} to ${phone}: "Test Message"`);
        return { success: true, provider: this.config.sms.provider };
    }

    // SMTP
    getSmtpConfig() { return this.config.smtp; }
    saveSmtpConfig(data: Partial<SmtpConfig>) {
        this.config.smtp = { ...this.config.smtp, ...data };
        this.saveConfig();
        return this.config.smtp;
    }

    async sendTestEmail(email: string) {
        if (!this.config.smtp.enabled) throw new Error("SMTP Integration disabled");
        console.log(`[Integration] Sending Email via ${this.config.smtp.host} to ${email}`);
        // Ideally use nodemailer here
        return { success: true };
    }

    // TOTP
    getTotpConfig() { return this.config.totp; }
    saveTotpConfig(data: Partial<TotpConfig>) {
        this.config.totp = { ...this.config.totp, ...data };
        this.saveConfig();
        return this.config.totp;
    }
}
