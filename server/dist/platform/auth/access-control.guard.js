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
exports.AccessControlGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let AccessControlGuard = class AccessControlGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.id) {
            return true;
        }
        const policy = await this.prisma.accessPolicy.findFirst({
            where: { userId: user.id },
        });
        if (!policy) {
            return true;
        }
        const userRole = user.role;
        if (userRole === 'owner' || userRole === 'superadmin') {
            return true;
        }
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentHour = now.getHours();
        const clientIp = request.ip;
        const allowedDays = policy.allowedDays ? policy.allowedDays.split(',').map(Number) : [];
        if (allowedDays.length > 0 && !allowedDays.includes(dayOfWeek)) {
            throw new common_1.ForbiddenException('Access denied on this day of the week.');
        }
        if (policy.allowedStartHour !== null && currentHour < policy.allowedStartHour) {
            throw new common_1.ForbiddenException(`Access allowed only after ${policy.allowedStartHour}:00.`);
        }
        if (policy.allowedEndHour !== null && currentHour >= policy.allowedEndHour) {
            throw new common_1.ForbiddenException(`Access allowed only before ${policy.allowedEndHour}:00.`);
        }
        const allowedIps = policy.allowedIps ? policy.allowedIps.split(',') : [];
        if (allowedIps.length > 0) {
            if (!allowedIps.includes(clientIp)) {
                throw new common_1.ForbiddenException('Access denied from this IP address.');
            }
        }
        return true;
    }
};
exports.AccessControlGuard = AccessControlGuard;
exports.AccessControlGuard = AccessControlGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccessControlGuard);
//# sourceMappingURL=access-control.guard.js.map