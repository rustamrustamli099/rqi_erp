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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceGuard = void 0;
const common_1 = require("@nestjs/common");
const maintenance_service_1 = require("./maintenance.service");
const core_1 = require("@nestjs/core");
let MaintenanceGuard = class MaintenanceGuard {
    maintenanceService;
    reflector;
    constructor(maintenanceService, reflector) {
        this.maintenanceService = maintenanceService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const status = await this.maintenanceService.isMaintenanceMode();
        if (!status.isEnabled) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        throw new common_1.ServiceUnavailableException(status.message);
    }
};
exports.MaintenanceGuard = MaintenanceGuard;
exports.MaintenanceGuard = MaintenanceGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [maintenance_service_1.MaintenanceService,
        core_1.Reflector])
], MaintenanceGuard);
//# sourceMappingURL=maintenance.guard.js.map