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
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const auth_service_1 = require("../auth.service");
let SessionService = class SessionService {
    prisma;
    authService;
    constructor(prisma, authService) {
        this.prisma = prisma;
        this.authService = authService;
    }
    async getAvailableScopes(userId) {
        const assignments = await this.prisma.userRoleAssignment.findMany({
            where: { userId },
            select: {
                scopeType: true,
                scopeId: true
            },
            distinct: ['scopeType', 'scopeId']
        });
        return assignments.map((a) => ({
            scopeType: a.scopeType,
            scopeId: a.scopeId,
            label: a.scopeId ? `Tenant ${a.scopeId}` : 'System'
        }));
    }
    async switchContext(userId, target) {
        if (target.scopeType === 'SYSTEM' && target.scopeId) {
            throw new common_1.ForbiddenException('SYSTEM scope cannot have a scopeId');
        }
        if (target.scopeType === 'TENANT' && !target.scopeId) {
            throw new common_1.ForbiddenException('TENANT scope requires a scopeId');
        }
        const hasAssignment = await this.prisma.userRoleAssignment.findFirst({
            where: {
                userId: userId,
                scopeType: target.scopeType,
                scopeId: target.scopeId || null
            }
        });
        if (!hasAssignment) {
            throw new common_1.ForbiddenException({
                message: 'Access Denied: You do not have roles in the requested scope.',
                code: 'SCOPE_NOT_ASSIGNED'
            });
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        return this.authService.issueTokenForScope(user, target.scopeType, target.scopeId || null);
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => auth_service_1.AuthService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], SessionService);
//# sourceMappingURL=session.service.js.map