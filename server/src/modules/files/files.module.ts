import { Module } from '@nestjs/common';
import { FilesUseCase } from './application/files.usecase';
import { FilesController } from './api/files.controller';
import { LocalStorageProvider } from './infrastructure/storage/local-storage.provider';
import { PrismaFileRepository } from './infrastructure/persistence/prisma-file.repository';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [FilesController],
    providers: [
        FilesUseCase,
        PrismaService,
        PrismaFileRepository,
        {
            provide: 'IStorageProvider',
            useClass: LocalStorageProvider // Easy switch to S3StorageProvider
        }
    ],
    exports: [FilesUseCase]
})
export class FilesModule { }
