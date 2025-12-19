
import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { IntegrationsService, SmsConfig, SmtpConfig, TotpConfig } from './integrations.service';

@Controller('admin/integrations')
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) { }

    // SMS
    @Get('sms')
    getSms() { return this.integrationsService.getSmsConfig(); }

    @Post('sms')
    saveSms(@Body() body: Partial<SmsConfig>) { return this.integrationsService.saveSmsConfig(body); }

    @Post('sms/test')
    async testSms(@Body('phone') phone: string) {
        try {
            return await this.integrationsService.sendTestSms(phone);
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
        }
    }

    // SMTP
    @Get('smtp')
    getSmtp() { return this.integrationsService.getSmtpConfig(); }

    @Post('smtp')
    saveSmtp(@Body() body: Partial<SmtpConfig>) { return this.integrationsService.saveSmtpConfig(body); }

    @Post('smtp/test')
    async testSmtp(@Body('email') email: string) {
        try {
            return await this.integrationsService.sendTestEmail(email);
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
        }
    }

    // TOTP
    @Get('totp')
    getTotp() { return this.integrationsService.getTotpConfig(); }

    @Post('totp')
    saveTotp(@Body() body: Partial<TotpConfig>) { return this.integrationsService.saveTotpConfig(body); }
}
