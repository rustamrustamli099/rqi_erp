"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs/common");
const files_usecase_1 = require("./application/files.usecase");
const files_controller_1 = require("./api/files.controller");
const local_storage_provider_1 = require("./infrastructure/storage/local-storage.provider");
const prisma_file_repository_1 = require("./infrastructure/persistence/prisma-file.repository");
const prisma_service_1 = require("../../prisma.service");
let FilesModule = class FilesModule {
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        controllers: [files_controller_1.FilesController],
        providers: [
            files_usecase_1.FilesUseCase,
            prisma_service_1.PrismaService,
            prisma_file_repository_1.PrismaFileRepository,
            {
                provide: 'IStorageProvider',
                useClass: local_storage_provider_1.LocalStorageProvider
            }
        ],
        exports: [files_usecase_1.FilesUseCase]
    })
], FilesModule);
//# sourceMappingURL=files.module.js.map