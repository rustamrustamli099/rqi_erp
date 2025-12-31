
import { Module } from '@nestjs/common';
import { BranchesUseCase } from './application/branches.usecase';
import { BranchesController } from './api/branches.controller';
import { PrismaService } from '../../prisma.service';
import { PrismaBranchRepository } from './infrastructure/prisma-branch.repository';

@Module({
    controllers: [BranchesController],
    providers: [
        BranchesUseCase,
        PrismaService,
        {
            provide: 'IBranchRepository',
            useClass: PrismaBranchRepository,
        },
    ],
    exports: [BranchesUseCase],
})
export class BranchesModule { }
