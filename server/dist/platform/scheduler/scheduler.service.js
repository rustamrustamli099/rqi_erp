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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../platform/redis/redis.service");
const schedule_1 = require("@nestjs/schedule");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    redisService;
    logger = new common_1.Logger(SchedulerService_1.name);
    constructor(redisService) {
        this.redisService = redisService;
    }
    onApplicationBootstrap() {
        this.logger.log('Scheduler initialized with Redis distributed locks.');
    }
    async handleNightlyCleanup() {
        const jobId = 'job:nightly_cleanup';
        const lockTtl = 60 * 60;
        const acquired = await this.redisService.acquireLock(jobId, lockTtl);
        if (!acquired) {
            this.logger.log('Nightly cleanup job skipped (lock held by another instance).');
            return;
        }
        try {
            this.logger.warn('Starting Nightly Cleanup...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            this.logger.log('Nightly Cleanup Completed.');
        }
        catch (error) {
            this.logger.error('Nightly Cleanup Failed', error);
        }
        finally {
            await this.redisService.releaseLock(jobId);
        }
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleNightlyCleanup", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map