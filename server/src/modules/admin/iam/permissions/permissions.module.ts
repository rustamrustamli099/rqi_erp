import { Module } from '@nestjs/common';
import { PermissionsController } from './api/permissions.controller';
import { IdentityModule } from '../../../../platform/identity/identity.module';
import { PrismaService } from '../../../../prisma.service';

@Module({
    imports: [IdentityModule],
    controllers: [PermissionsController],
    providers: [PrismaService], // Added PrismaService explicitly
    exports: []
})
export class PermissionsModule { }
