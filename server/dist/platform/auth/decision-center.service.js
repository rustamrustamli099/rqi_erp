"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionCenterService = void 0;
const common_1 = require("@nestjs/common");
let DecisionCenterService = class DecisionCenterService {
    isAllowed(userPermissions, requiredPermissions) {
        if (!requiredPermissions || requiredPermissions.length === 0)
            return true;
        if (!userPermissions || userPermissions.length === 0)
            return false;
        return requiredPermissions.some(required => userPermissions.includes(required));
    }
    isAllowedStrict(userPermissions, requiredPermissions) {
        if (!requiredPermissions || requiredPermissions.length === 0)
            return true;
        if (!userPermissions || userPermissions.length === 0)
            return false;
        return requiredPermissions.every(required => userPermissions.includes(required));
    }
};
exports.DecisionCenterService = DecisionCenterService;
exports.DecisionCenterService = DecisionCenterService = __decorate([
    (0, common_1.Injectable)()
], DecisionCenterService);
//# sourceMappingURL=decision-center.service.js.map