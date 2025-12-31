import { Module } from '@nestjs/common';
import { PackagesUseCase } from './application/packages.usecase';
import { PackagesController } from './api/packages.controller';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [PackagesController],
    providers: [
        PrismaService,
        PackagesUseCase,
        {
            provide: 'IPackagesService',
            useClass: PackagesUseCase
        }
    ],
    exports: ['IPackagesService']
})
export class PackagesModule { }
