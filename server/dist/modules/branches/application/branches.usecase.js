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
exports.BranchesUseCase = void 0;
const common_1 = require("@nestjs/common");
const branch_entity_1 = require("../domain/branch.entity");
const event_bus_service_1 = require("../../../shared-kernel/event-bus/event-bus.service");
let BranchesUseCase = class BranchesUseCase {
    branchRepository;
    eventBus;
    constructor(branchRepository, eventBus) {
        this.branchRepository = branchRepository;
        this.eventBus = eventBus;
    }
    async create(tenantId, name, address, phone) {
        const branch = branch_entity_1.Branch.create(tenantId, name, address, phone);
        return this.branchRepository.create(branch);
    }
    async findAll(tenantId) {
        return this.branchRepository.findAll(tenantId);
    }
    async findOne(id) {
        const branch = await this.branchRepository.findById(id);
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        return branch;
    }
    async update(id, data) {
        const branch = await this.branchRepository.findById(id);
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        return this.branchRepository.update(id, data);
    }
    async remove(id) {
        return this.branchRepository.delete(id);
    }
};
exports.BranchesUseCase = BranchesUseCase;
exports.BranchesUseCase = BranchesUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IBranchRepository')),
    __metadata("design:paramtypes", [Object, event_bus_service_1.DomainEventBus])
], BranchesUseCase);
//# sourceMappingURL=branches.usecase.js.map