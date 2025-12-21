"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let IntegrationsService = class IntegrationsService {
    dataPath = path.join(process.cwd(), 'data', 'integrations.json');
    dataDir = path.join(process.cwd(), 'data');
    config = {
        sms: { provider: 'twilio', apiKey: '', senderId: '', enabled: false },
        smtp: { host: '', port: 587, user: '', pass: '', secure: true, enabled: false },
        totp: { issuer: 'RQI ERP', algo: 'SHA1', enforce: false },
    };
    onModuleInit() {
        this.ensureDataDir();
        this.loadConfig();
    }
    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }
    loadConfig() {
        if (fs.existsSync(this.dataPath)) {
            try {
                const raw = fs.readFileSync(this.dataPath, 'utf-8');
                const loaded = JSON.parse(raw);
                this.config = { ...this.config, ...loaded };
            }
            catch (e) {
                console.error('Failed to load integrations.json, using defaults', e);
            }
        }
        else {
            this.saveConfig();
        }
    }
    saveConfig() {
        try {
            fs.writeFileSync(this.dataPath, JSON.stringify(this.config, null, 2));
        }
        catch (e) {
            console.error('Failed to save integrations.json', e);
        }
    }
    getSmsConfig() { return this.config.sms; }
    saveSmsConfig(data) {
        this.config.sms = { ...this.config.sms, ...data };
        this.saveConfig();
        return this.config.sms;
    }
    async sendTestSms(phone) {
        if (!this.config.sms.enabled)
            throw new Error("SMS Integration disabled");
        console.log(`[Integration] Sending SMS via ${this.config.sms.provider} to ${phone}: "Test Message"`);
        return { success: true, provider: this.config.sms.provider };
    }
    getSmtpConfig() { return this.config.smtp; }
    saveSmtpConfig(data) {
        this.config.smtp = { ...this.config.smtp, ...data };
        this.saveConfig();
        return this.config.smtp;
    }
    async sendTestEmail(email) {
        if (!this.config.smtp.enabled)
            throw new Error("SMTP Integration disabled");
        console.log(`[Integration] Sending Email via ${this.config.smtp.host} to ${email}`);
        return { success: true };
    }
    getTotpConfig() { return this.config.totp; }
    saveTotpConfig(data) {
        this.config.totp = { ...this.config.totp, ...data };
        this.saveConfig();
        return this.config.totp;
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)()
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map