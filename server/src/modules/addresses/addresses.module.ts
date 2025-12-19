import { Module } from '@nestjs/common';
import { AddressesController } from './api/addresses.controller';
import { AddressesUseCase } from './application/addresses.usecase';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [AddressesController],
    providers: [AddressesUseCase, PrismaService], // Ensure PrismaService is available
})
export class AddressesModule { }
