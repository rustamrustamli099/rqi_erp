"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextGuard = void 0;
const common_1 = require("@nestjs/common");
let TenantContextGuard = class TenantContextGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user && user.tenantId) {
            request.tenantId = user.tenantId;
            const params = request.params;
            if (params && params.tenantId) {
                if (params.tenantId !== user.tenantId) {
                    if (user.role !== 'SuperAdmin' && user.role !== 'Owner') {
                        throw new common_1.ForbiddenException('Access to other tenant scope denied');
                    }
                }
            }
        }
        else if (user && !user.tenantId) {
        }
        return true;
    }
};
exports.TenantContextGuard = TenantContextGuard;
exports.TenantContextGuard = TenantContextGuard = __decorate([
    (0, common_1.Injectable)()
], TenantContextGuard);
//# sourceMappingURL=tenant-context.guard.js.map