import { Module } from '@nestjs/common';
import { MenusController } from './api/menus.controller';
import { MenusUseCase } from './application/menus.usecase';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [MenusController],
    providers: [MenusUseCase, PrismaService],
    exports: [MenusUseCase],
})
export class MenusModule { }
