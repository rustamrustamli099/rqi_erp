"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
let CacheService = CacheService_1 = class CacheService {
    logger = new common_1.Logger(CacheService_1.name);
    store = new Map();
    async get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            this.logger.debug(`Cache EXPIRED: ${key}`);
            return null;
        }
        this.logger.debug(`Cache HIT: ${key}`);
        return entry.value;
    }
    async set(key, value, ttlSeconds) {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.store.set(key, {
            value,
            expiresAt
        });
        this.logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
    }
    async del(key) {
        const deleted = this.store.delete(key);
        if (deleted) {
            this.logger.debug(`Cache DEL: ${key}`);
        }
    }
    async delByPrefix(prefix) {
        let count = 0;
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
                count++;
            }
        }
        if (count > 0) {
            this.logger.debug(`Cache DEL by prefix "${prefix}": ${count} keys`);
        }
        return count;
    }
    async reset() {
        const size = this.store.size;
        this.store.clear();
        this.logger.warn(`Cache RESET: Cleared ${size} entries`);
    }
    async size() {
        return this.store.size;
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)()
], CacheService);
//# sourceMappingURL=cache.service.js.map