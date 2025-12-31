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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaFileRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma.service");
const file_entity_1 = require("../../domain/file.entity");
let PrismaFileRepository = class PrismaFileRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(file) {
        const created = await this.prisma.file.create({
            data: {
                id: file.id,
                originalName: file.originalName,
                filename: file.filename,
                mimeType: file.mimeType,
                size: file.size,
                path: file.path,
                publicUrl: file.publicUrl,
                uploadedBy: file.uploadedBy,
                module: 'GENERAL',
                usage: 'OTHER'
            }
        });
        return this.mapToDomain(created);
    }
    mapToDomain(row) {
        return new file_entity_1.FileEntity(row.id, row.originalName, row.filename, row.mimeType, row.size, row.path, row.publicUrl, row.uploadedBy, row.createdAt);
    }
};
exports.PrismaFileRepository = PrismaFileRepository;
exports.PrismaFileRepository = PrismaFileRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaFileRepository);
//# sourceMappingURL=prisma-file.repository.js.map