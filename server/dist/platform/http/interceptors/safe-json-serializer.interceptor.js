"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SafeJsonSerializerInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeJsonSerializerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let SafeJsonSerializerInterceptor = SafeJsonSerializerInterceptor_1 = class SafeJsonSerializerInterceptor {
    logger = new common_1.Logger(SafeJsonSerializerInterceptor_1.name);
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)(data => {
            return this.safeSanitize(data);
        }));
    }
    safeSanitize(obj, seen = new WeakSet()) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (seen.has(obj)) {
            return '[Circular]';
        }
        seen.add(obj);
        if (Array.isArray(obj)) {
            return obj.map(item => this.safeSanitize(item, seen));
        }
        const cleaned = {};
        for (const key of Object.keys(obj)) {
            cleaned[key] = this.safeSanitize(obj[key], seen);
        }
        return cleaned;
    }
};
exports.SafeJsonSerializerInterceptor = SafeJsonSerializerInterceptor;
exports.SafeJsonSerializerInterceptor = SafeJsonSerializerInterceptor = SafeJsonSerializerInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], SafeJsonSerializerInterceptor);
//# sourceMappingURL=safe-json-serializer.interceptor.js.map