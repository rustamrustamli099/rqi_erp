import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  providers: [RolesService, PrismaService],
  controllers: [RolesController]
})
export class RolesModule { }
