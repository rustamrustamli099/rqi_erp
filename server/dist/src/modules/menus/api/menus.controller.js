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
exports.MenusController = void 0;
const common_1 = require("@nestjs/common");
const menus_usecase_1 = require("../application/menus.usecase");
const jwt_auth_guard_1 = require("../../../platform/auth/jwt-auth.guard");
let MenusController = class MenusController {
    menusUseCase;
    constructor(menusUseCase) {
        this.menusUseCase = menusUseCase;
    }
    async getSidebar(req) {
        return this.menusUseCase.getSidebar(req.user);
    }
};
exports.MenusController = MenusController;
__decorate([
    (0, common_1.Get)('menu'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "getSidebar", null);
exports.MenusController = MenusController = __decorate([
    (0, common_1.Controller)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [menus_usecase_1.MenusUseCase])
], MenusController);
//# sourceMappingURL=menus.controller.js.map