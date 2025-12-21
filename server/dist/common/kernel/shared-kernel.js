"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InMemoryEventBus_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEventBus = exports.Result = exports.DomainEvent = exports.BaseEntity = void 0;
class BaseEntity {
    id;
    createdAt;
    updatedAt;
    constructor(id, createdAt, updatedAt) {
        this.id = id || crypto.randomUUID();
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }
}
exports.BaseEntity = BaseEntity;
class DomainEvent {
    occurredOn;
    eventName;
    constructor(eventName) {
        this.occurredOn = new Date();
        this.eventName = eventName;
    }
}
exports.DomainEvent = DomainEvent;
class Result {
    isSuccess;
    isFailure;
    error;
    _value;
    constructor(isSuccess, error, value) {
        if (isSuccess && error) {
            throw new Error("InvalidOperation: A result cannot be successful and contain an error");
        }
        if (!isSuccess && !error) {
            throw new Error("InvalidOperation: A failing result needs to contain an error message");
        }
        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;
    }
    getValue() {
        if (!this.isSuccess) {
            throw new Error("Can't get the value of an error result. Use 'error' instead.");
        }
        return this._value;
    }
    static ok(value) {
        return new Result(true, undefined, value);
    }
    static fail(error) {
        return new Result(false, error);
    }
}
exports.Result = Result;
const common_1 = require("@nestjs/common");
let InMemoryEventBus = InMemoryEventBus_1 = class InMemoryEventBus {
    handlers = new Map();
    logger = new common_1.Logger(InMemoryEventBus_1.name);
    async publish(event) {
        this.logger.debug(`Publishing event: ${event.eventName}`);
        const handlers = this.handlers.get(event.eventName);
        if (handlers) {
            await Promise.all(handlers.map(handler => handler(event).catch(err => {
                this.logger.error(`Error in event handler for ${event.eventName}:`, err);
            })));
        }
    }
    subscribe(eventName, handler) {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName)?.push(handler);
        this.logger.log(`Subscribed to event: ${eventName}`);
    }
};
exports.InMemoryEventBus = InMemoryEventBus;
exports.InMemoryEventBus = InMemoryEventBus = InMemoryEventBus_1 = __decorate([
    (0, common_1.Injectable)()
], InMemoryEventBus);
//# sourceMappingURL=shared-kernel.js.map