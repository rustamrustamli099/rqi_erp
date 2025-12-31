"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetentionModule = void 0;
const common_1 = require("@nestjs/common");
const retention_service_1 = require("./retention.service");
const retention_controller_1 = require("./retention.controller");
const prisma_service_1 = require("../../prisma.service");
let RetentionModule = class RetentionModule {
};
exports.RetentionModule = RetentionModule;
exports.RetentionModule = RetentionModule = __decorate([
    (0, common_1.Module)({
        providers: [retention_service_1.RetentionService, prisma_service_1.PrismaService],
        controllers: [retention_controller_1.RetentionController],
        exports: [retention_service_1.RetentionService]
    })
], RetentionModule);
//# sourceMappingURL=retention.module.js.map