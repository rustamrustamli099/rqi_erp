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
let MenusUseCase = class MenusUseCase {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSidebar(user) {
        if (user.isOwner) {
            return this.enrichMenu(menu_definition_1.ADMIN_MENU_TREE);
        }
        const userPermissions = new Set(user.permissions || []);
        return this.filterMenu(menu_definition_1.ADMIN_MENU_TREE, userPermissions);
    }
    enrichMenu(items) {
        return items.map(item => ({
            ...item,
            children: item.children ? this.enrichMenu(item.children) : undefined
        }));
    }
    filterMenu(items, userPermissions) {
        const filtered = [];
        for (const item of items) {
            const hasPermission = !item.permission || userPermissions.has(item.permission);
            if (hasPermission) {
                if (item.children) {
                    const filteredChildren = this.filterMenu(item.children, userPermissions);
                    if (filteredChildren.length > 0 || !item.children.length) {
                        filtered.push({ ...item, children: filteredChildren });
                    }
                }
                else {
                    filtered.push(item);
                }
            }
        }
        return filtered;
    }
    async createDefaultMenu() {
        return;
    }
};
exports.MenusUseCase = MenusUseCase;
exports.MenusUseCase = MenusUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusUseCase);
//# sourceMappingURL=menus.usecase.js.map