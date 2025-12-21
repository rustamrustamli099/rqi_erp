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
exports.MaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../platform/redis/redis.service");
let MaintenanceService = class MaintenanceService {
    redisService;
    MAINTENANCE_KEY = 'sys:maintenance';
    MSG_KEY = 'sys:maintenance:msg';
    constructor(redisService) {
        this.redisService = redisService;
    }
    async enableMaintenance(message = 'System is under maintenance. Please try again later.') {
        await this.redisService.set(this.MAINTENANCE_KEY, 'true');
        await this.redisService.set(this.MSG_KEY, message);
    }
    async disableMaintenance() {
        await this.redisService.del(this.MAINTENANCE_KEY);
        await this.redisService.del(this.MSG_KEY);
    }
    async isMaintenanceMode() {
        const isEnabled = await this.redisService.get(this.MAINTENANCE_KEY);
        if (isEnabled === 'true') {
            const message = await this.redisService.get(this.MSG_KEY) || 'Maintenance';
            return { isEnabled: true, message };
        }
        return { isEnabled: false };
    }
};
exports.MaintenanceService = MaintenanceService;
exports.MaintenanceService = MaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], MaintenanceService);
//# sourceMappingURL=maintenance.service.js.map