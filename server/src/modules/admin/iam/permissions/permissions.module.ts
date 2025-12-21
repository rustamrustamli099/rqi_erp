import { Module } from '@nestjs/common';
import { PermissionsController } from './api/permissions.controller';
import { PermissionsService } from './application/permissions.service';
import { IdentityModule } from '../../../../platform/identity/identity.module';
import { MenuService } from '../../../../platform/menu/menu.service';

import { PrismaService } from '../../../../prisma.service';

@Module({
    imports: [IdentityModule],
    controllers: [PermissionsController],
    providers: [PermissionsService, MenuService, PrismaService],
    exports: [PermissionsService]
})
export class PermissionsModule { }
