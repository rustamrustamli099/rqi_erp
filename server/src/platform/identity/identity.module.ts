import { Module, forwardRef } from '@nestjs/common';
import { IdentityUseCase } from './application/identity.usecase';
import { GovernanceService } from './application/governance.service';
import { IdentityController } from './api/identity.controller';
import { UsersController } from './api/users.controller';
import { GovernanceController } from './api/governance.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../prisma.service';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { IUserRepository } from './domain/user.repository.interface';
import { PrismaRoleRepository } from './infrastructure/prisma-role.repository';
import { IRoleRepository } from './domain/role.repository.interface';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [IdentityController, UsersController, GovernanceController],
    providers: [
        IdentityUseCase,
        GovernanceService,
        PrismaService,
        {
            provide: IUserRepository,
            useClass: PrismaUserRepository
        },
        {
            provide: IRoleRepository,
            useClass: PrismaRoleRepository
        }
    ],
    exports: [IdentityUseCase, GovernanceService, IUserRepository, IRoleRepository]
})
export class IdentityModule { }
