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
exports.MenusUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const menu_definition_1 = require("../../../platform/menu/menu.definition");
const decision_center_service_1 = require("../../../platform/decision/decision-center.service");
let MenusUseCase = class MenusUseCase {
    prisma;
    decisionCenter;
    constructor(prisma, decisionCenter) {
        this.prisma = prisma;
        this.decisionCenter = decisionCenter;
    }
    async getSidebar(user) {
        const userPermissions = user.permissions || [];
        return this.decisionCenter.resolveNavigationTree(menu_definition_1.ADMIN_MENU_TREE, userPermissions);
    }
    async createDefaultMenu() {
        return;
    }
};
exports.MenusUseCase = MenusUseCase;
exports.MenusUseCase = MenusUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        decision_center_service_1.DecisionCenterService])
], MenusUseCase);
//# sourceMappingURL=menus.usecase.js.map