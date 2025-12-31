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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_usecase_1 = require("../application/dashboard.usecase");
const jwt_auth_guard_1 = require("../../../platform/auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../../platform/auth/permissions.decorator");
const permissions_1 = require("../../../platform/auth/permissions");
let DashboardController = class DashboardController {
    dashboardUseCase;
    constructor(dashboardUseCase) {
        this.dashboardUseCase = dashboardUseCase;
    }
    getStats() {
        return this.dashboardUseCase.getStats();
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_decorator_1.Permissions)(permissions_1.PermissionRegistry.DASHBOARD.VIEW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getStats", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [dashboard_usecase_1.DashboardUseCase])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map