import { Module, forwardRef } from '@nestjs/common';
import { IdentityUseCase } from './application/identity.usecase';
import { IdentityController } from './api/identity.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../prisma.service';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { IUserRepository } from './domain/user.repository.interface';
import { PrismaRoleRepository } from './infrastructure/prisma-role.repository';
import { IRoleRepository } from './domain/role.repository.interface';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [IdentityController],
    providers: [
        IdentityUseCase,
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
    exports: [IdentityUseCase, IUserRepository, IRoleRepository]
})
export class IdentityModule { }
