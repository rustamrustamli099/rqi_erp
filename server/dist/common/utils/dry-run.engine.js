"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionDryRunEngine = void 0;
const common_1 = require("@nestjs/common");
let PermissionDryRunEngine = class PermissionDryRunEngine {
    static evaluate(userPermissions, requiredPermissions) {
        if (!requiredPermissions || requiredPermissions.length === 0)
            return { allowed: true };
        if (!userPermissions || userPermissions.length === 0)
            return { allowed: false };
        const hasPermission = requiredPermissions.some(permission => userPermissions.includes(permission));
        return { allowed: hasPermission };
    }
    static evaluateStrict(userPermissions, requiredPermissions) {
        const missing = requiredPermissions.filter(p => !userPermissions.includes(p));
        return {
            allowed: missing.length === 0,
            missing
        };
    }
};
exports.PermissionDryRunEngine = PermissionDryRunEngine;
exports.PermissionDryRunEngine = PermissionDryRunEngine = __decorate([
    (0, common_1.Injectable)()
], PermissionDryRunEngine);
//# sourceMappingURL=dry-run.engine.js.map