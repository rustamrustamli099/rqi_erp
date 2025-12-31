"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleAssignmentsModule = void 0;
const common_1 = require("@nestjs/common");
const role_assignments_service_1 = require("./application/role-assignments.service");
const role_assignments_controller_1 = require("./api/role-assignments.controller");
const prisma_service_1 = require("../../../../prisma.service");
const audit_module_1 = require("../../../../system/audit/audit.module");
let RoleAssignmentsModule = class RoleAssignmentsModule {
};
exports.RoleAssignmentsModule = RoleAssignmentsModule;
exports.RoleAssignmentsModule = RoleAssignmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [audit_module_1.AuditModule],
        controllers: [role_assignments_controller_1.RoleAssignmentsController],
        providers: [role_assignments_service_1.RoleAssignmentsService, prisma_service_1.PrismaService],
        exports: [role_assignments_service_1.RoleAssignmentsService]
    })
], RoleAssignmentsModule);
//# sourceMappingURL=role-assignments.module.js.map