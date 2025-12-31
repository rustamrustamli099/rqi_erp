"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleApprovalsModule = void 0;
const common_1 = require("@nestjs/common");
const role_approvals_controller_1 = require("./api/role-approvals.controller");
const role_approvals_service_1 = require("./application/role-approvals.service");
const prisma_service_1 = require("../../../../prisma.service");
const audit_service_1 = require("../../../../system/audit/audit.service");
let RoleApprovalsModule = class RoleApprovalsModule {
};
exports.RoleApprovalsModule = RoleApprovalsModule;
exports.RoleApprovalsModule = RoleApprovalsModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [role_approvals_controller_1.RoleApprovalsController],
        providers: [role_approvals_service_1.RoleApprovalsService, prisma_service_1.PrismaService, audit_service_1.AuditService],
        exports: [role_approvals_service_1.RoleApprovalsService],
    })
], RoleApprovalsModule);
//# sourceMappingURL=role-approvals.module.js.map