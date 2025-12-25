import { Module } from '@nestjs/common';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        RolesModule // Import to access RolesService
    ],
    controllers: [ApprovalsController],
    providers: [ApprovalsService],
    exports: [ApprovalsService]
})
export class ApprovalsModule { }
