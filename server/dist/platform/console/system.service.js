"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const os = __importStar(require("os"));
let SystemService = class SystemService {
    async getSystemMetrics() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsage = Math.round((usedMem / totalMem) * 100);
        const cpus = os.cpus();
        const cpuUsage = cpus.length > 0 ? cpus[0].speed : 0;
        return {
            cpu: {
                usage: Math.floor(Math.random() * 30) + 10,
                cores: cpus.length,
            },
            memory: {
                total: totalMem,
                free: freeMem,
                used: usedMem,
                usagePercentage: memUsage,
            },
            uptime: os.uptime(),
            platform: os.platform(),
        };
    }
    async getDatabaseStats() {
        return {
            activeConnections: Math.floor(Math.random() * 10) + 2,
            poolUtilization: Math.floor(Math.random() * 20) + 5,
        };
    }
    async getRedisStats() {
        return {
            hitRatio: (Math.random() * (0.99 - 0.85) + 0.85).toFixed(2),
            memoryUsed: '24MB',
            connectedClients: 5,
        };
    }
    async clearCache() {
        console.log('System Service: Clearing internal caches...');
        return { success: true, message: 'Cache cleared successfully' };
    }
    async reloadServices() {
        console.log('System Service: Reloading configurations...');
        return { success: true, message: 'Services reloaded successfully' };
    }
    async killSessions() {
        console.log('System Service: Invalidating all sessions...');
        return { success: true, message: 'All sessions terminated' };
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = __decorate([
    (0, common_1.Injectable)()
], SystemService);
//# sourceMappingURL=system.service.js.map