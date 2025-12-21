"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const integrations_service_1 = require("./integrations.service");
let IntegrationsController = class IntegrationsController {
    integrationsService;
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    getSms() { return this.integrationsService.getSmsConfig(); }
    saveSms(body) { return this.integrationsService.saveSmsConfig(body); }
    async testSms(phone) {
        try {
            return await this.integrationsService.sendTestSms(phone);
        }
        catch (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getSmtp() { return this.integrationsService.getSmtpConfig(); }
    saveSmtp(body) { return this.integrationsService.saveSmtpConfig(body); }
    async testSmtp(email) {
        try {
            return await this.integrationsService.sendTestEmail(email);
        }
        catch (e) {
            throw new common_1.HttpException(e.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getTotp() { return this.integrationsService.getTotpConfig(); }
    saveTotp(body) { return this.integrationsService.saveTotpConfig(body); }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Get)('sms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getSms", null);
__decorate([
    (0, common_1.Post)('sms'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "saveSms", null);
__decorate([
    (0, common_1.Post)('sms/test'),
    __param(0, (0, common_1.Body)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "testSms", null);
__decorate([
    (0, common_1.Get)('smtp'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getSmtp", null);
__decorate([
    (0, common_1.Post)('smtp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "saveSmtp", null);
__decorate([
    (0, common_1.Post)('smtp/test'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "testSmtp", null);
__decorate([
    (0, common_1.Get)('totp'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getTotp", null);
__decorate([
    (0, common_1.Post)('totp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "saveTotp", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, common_1.Controller)('admin/integrations'),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map