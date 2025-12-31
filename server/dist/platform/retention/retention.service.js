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
var RetentionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetentionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let RetentionService = RetentionService_1 = class RetentionService {
    prisma;
    logger = new common_1.Logger(RetentionService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPolicy(data) {
        return this.prisma.retentionPolicy.create({ data });
    }
    async getPolicies() {
        return this.prisma.retentionPolicy.findMany();
    }
    async deletePolicy(id) {
        return this.prisma.retentionPolicy.delete({ where: { id } });
    }
    async executePolicy(dryRun = true) {
        const policies = await this.prisma.retentionPolicy.findMany({ where: { isActive: true } });
        const results = [];
        for (const policy of policies) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - policy.days);
            this.logger.log(`Executing retention for ${policy.entity} (Before ${cutoffDate.toISOString()}) - DryRun: ${dryRun}`);
            let count = 0;
            try {
                if (policy.entity === 'AuditLog') {
                    if (dryRun) {
                        count = await this.prisma.auditLog.count({ where: { createdAt: { lt: cutoffDate } } });
                    }
                    else {
                        const batch = await this.prisma.auditLog.deleteMany({ where: { createdAt: { lt: cutoffDate } } });
                        count = batch.count;
                    }
                }
                else if (policy.entity === 'Notification') {
                    if (dryRun) {
                        count = await this.prisma.notification.count({ where: { createdAt: { lt: cutoffDate } } });
                    }
                    else {
                        const batch = await this.prisma.notification.deleteMany({ where: { createdAt: { lt: cutoffDate } } });
                        count = batch.count;
                    }
                }
                results.push({
                    policyId: policy.id,
                    entity: policy.entity,
                    affectedRows: count,
                    status: 'SUCCESS'
                });
                if (!dryRun) {
                    await this.prisma.retentionPolicy.update({
                        where: { id: policy.id },
                        data: { lastRunAt: new Date() }
                    });
                }
            }
            catch (error) {
                this.logger.error(`Failed to execute policy ${policy.id}`, error);
                results.push({
                    policyId: policy.id,
                    entity: policy.entity,
                    error: error.message,
                    status: 'FAILED'
                });
            }
        }
        return results;
    }
};
exports.RetentionService = RetentionService;
exports.RetentionService = RetentionService = RetentionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RetentionService);
//# sourceMappingURL=retention.service.js.map