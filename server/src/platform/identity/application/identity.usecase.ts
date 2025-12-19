
import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository.interface';
import { User } from '../domain/user.entity';
// import { DomainEventBus } from '../../../core/events/event-bus.service';
import { PermissionCacheService } from '../../auth/permission-cache.service';
import { forwardRef } from '@nestjs/common';

@Injectable()
export class IdentityUseCase {
    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
        @Inject(forwardRef(() => PermissionCacheService)) private readonly permissionCache: PermissionCacheService,
        // private readonly eventBus: DomainEventBus,
    ) { }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async findUserById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async findUserWithPermissions(id: string): Promise<any> {
        return this.userRepository.findByIdWithPermissions(id);
    }

    async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
        return this.userRepository.updateRefreshToken(id, refreshToken);
    }

    async enableMfa(id: string, secret: string): Promise<void> {
        return this.userRepository.enableMfa(id, secret);
    }

    async createUser(data: any): Promise<User> {
        // Factory logic here
        // const user = User.create(...)
        // await this.repository.save(user);
        // return user;
        return {} as User; // Placeholder
    }

    async assignRole(userId: string, roleId: string, tenantId?: string): Promise<void> {
        // 1. Update DB
        await this.userRepository.assignRole(userId, roleId, tenantId);

        // 2. Invalidate Cache [CRITICAL]
        const scope = tenantId ? 'TENANT' : 'SYSTEM';
        await this.permissionCache.clearPermissions(userId, tenantId, scope);

        // 3. Audit (Should trigger event or call AuditService)
        // this.eventBus.emit(new RoleAssignedEvent(userId, roleName));
    }

    async revokeRole(userId: string, roleId: string, tenantId?: string): Promise<void> {
        // 1. Update DB
        await this.userRepository.revokeRole(userId, roleId, tenantId);

        // 2. Invalidate Cache
        const scope = tenantId ? 'TENANT' : 'SYSTEM';
        await this.permissionCache.clearPermissions(userId, tenantId, scope);
    }
}
