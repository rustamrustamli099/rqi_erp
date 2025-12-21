"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsModule = void 0;
const common_1 = require("@nestjs/common");
const tenants_controller_1 = require("./api/tenants.controller");
const tenants_usecase_1 = require("./application/tenants.usecase");
const prisma_service_1 = require("../../prisma.service");
const prisma_tenant_repository_1 = require("./infrastructure/prisma-tenant.repository");
const tenant_repository_interface_1 = require("./domain/tenant.repository.interface");
const domain_events_module_1 = require("../../shared-kernel/event-bus/domain-events.module");
let TenantsModule = class TenantsModule {
};
exports.TenantsModule = TenantsModule;
exports.TenantsModule = TenantsModule = __decorate([
    (0, common_1.Module)({
        imports: [domain_events_module_1.DomainEventsModule],
        controllers: [tenants_controller_1.TenantsController],
        providers: [
            tenants_usecase_1.TenantsUseCase,
            prisma_service_1.PrismaService,
            {
                provide: tenant_repository_interface_1.ITenantRepository,
                useClass: prisma_tenant_repository_1.PrismaTenantRepository,
            },
        ],
        exports: [tenants_usecase_1.TenantsUseCase],
    })
], TenantsModule);
//# sourceMappingURL=tenants.module.js.map