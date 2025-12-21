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
var TenantsUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsUseCase = void 0;
const common_1 = require("@nestjs/common");
const tenant_repository_interface_1 = require("../domain/tenant.repository.interface");
const event_bus_service_1 = require("../../../shared-kernel/event-bus/event-bus.service");
const tenant_entity_1 = require("../domain/tenant.entity");
let TenantsUseCase = TenantsUseCase_1 = class TenantsUseCase {
    repository;
    eventBus;
    logger = new common_1.Logger(TenantsUseCase_1.name);
    constructor(repository, eventBus) {
        this.repository = repository;
        this.eventBus = eventBus;
    }
    async createTenant(name, email) {
        this.logger.log(`Creating tenant: ${name}`);
        const id = crypto.randomUUID();
        const tenant = tenant_entity_1.Tenant.create(id, name, email);
        await this.repository.save(tenant);
        this.eventBus.publishAll(tenant.domainEvents);
        tenant.clearEvents();
        return tenant;
    }
    async getAllTenants() {
        return this.repository.findAll();
    }
};
exports.TenantsUseCase = TenantsUseCase;
exports.TenantsUseCase = TenantsUseCase = TenantsUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tenant_repository_interface_1.ITenantRepository)),
    __metadata("design:paramtypes", [Object, event_bus_service_1.DomainEventBus])
], TenantsUseCase);
//# sourceMappingURL=tenants.usecase.js.map