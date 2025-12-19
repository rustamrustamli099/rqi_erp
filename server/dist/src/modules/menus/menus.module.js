"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusModule = void 0;
const common_1 = require("@nestjs/common");
const menus_controller_1 = require("./api/menus.controller");
const menus_usecase_1 = require("./application/menus.usecase");
const prisma_service_1 = require("../../prisma.service");
let MenusModule = class MenusModule {
};
exports.MenusModule = MenusModule;
exports.MenusModule = MenusModule = __decorate([
    (0, common_1.Module)({
        controllers: [menus_controller_1.MenusController],
        providers: [menus_usecase_1.MenusUseCase, prisma_service_1.PrismaService],
        exports: [menus_usecase_1.MenusUseCase],
    })
], MenusModule);
//# sourceMappingURL=menus.module.js.map