"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEventsModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_bus_service_1 = require("./event-bus.service");
let DomainEventsModule = class DomainEventsModule {
};
exports.DomainEventsModule = DomainEventsModule;
exports.DomainEventsModule = DomainEventsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [event_emitter_1.EventEmitterModule.forRoot()],
        providers: [event_bus_service_1.DomainEventBus],
        exports: [event_bus_service_1.DomainEventBus],
    })
], DomainEventsModule);
//# sourceMappingURL=domain-events.module.js.map