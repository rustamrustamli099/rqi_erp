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
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const evidence_service_1 = require("./evidence.service");
const jwt_auth_guard_1 = require("../../platform/auth/jwt-auth.guard");
const permissions_guard_1 = require("../../platform/auth/permissions.guard");
let ComplianceController = class ComplianceController {
    evidenceService;
    constructor(evidenceService) {
        this.evidenceService = evidenceService;
    }
    async exportEvidence(type, res) {
        let data;
        if (type === 'soc2') {
            data = await this.evidenceService.generateSoc2Evidence();
        }
        else if (type === 'iso27001') {
            data = await this.evidenceService.generateIsoSoa();
        }
        else {
            throw new common_1.NotFoundException('Unsupported evidence type');
        }
        res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${type}_evidence_${Date.now()}.json"`,
        });
        return res.json(data);
    }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Get)('export/:type'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "exportEvidence", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, common_1.Controller)('compliance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [evidence_service_1.EvidenceService])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map