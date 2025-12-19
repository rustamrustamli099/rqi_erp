"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityModule = void 0;
const common_1 = require("@nestjs/common");
const identity_usecase_1 = require("./application/identity.usecase");
const identity_controller_1 = require("./api/identity.controller");
const auth_module_1 = require("../auth/auth.module");
const prisma_service_1 = require("../../prisma.service");
const prisma_user_repository_1 = require("./infrastructure/prisma-user.repository");
const user_repository_interface_1 = require("./domain/user.repository.interface");
const prisma_role_repository_1 = require("./infrastructure/prisma-role.repository");
const role_repository_interface_1 = require("./domain/role.repository.interface");
let IdentityModule = class IdentityModule {
};
exports.IdentityModule = IdentityModule;
exports.IdentityModule = IdentityModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => auth_module_1.AuthModule)],
        controllers: [identity_controller_1.IdentityController],
        providers: [
            identity_usecase_1.IdentityUseCase,
            prisma_service_1.PrismaService,
            {
                provide: user_repository_interface_1.IUserRepository,
                useClass: prisma_user_repository_1.PrismaUserRepository
            },
            {
                provide: role_repository_interface_1.IRoleRepository,
                useClass: prisma_role_repository_1.PrismaRoleRepository
            }
        ],
        exports: [identity_usecase_1.IdentityUseCase, user_repository_interface_1.IUserRepository, role_repository_interface_1.IRoleRepository]
    })
], IdentityModule);
//# sourceMappingURL=identity.module.js.map