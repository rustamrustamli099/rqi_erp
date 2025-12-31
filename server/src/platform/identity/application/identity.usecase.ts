
import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository.interface';
import { User } from '../domain/user.entity';
// import { DomainEventBus } from '../../../core/events/event-bus.service';

@Injectable()
export class IdentityUseCase {
    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
        // private readonly eventBus: DomainEventBus,
    ) { }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async findAllUsers(tenantId: string) {
        return this.userRepository.findAll(tenantId);
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
        // [SAP-GRADE] Stateless Session - No Cache to Invalidate for now.
        // If EffectivePermissionsService adds caching later, we will emit an event here.

        // 3. Audit (Should trigger event or call AuditService)
        // this.eventBus.emit(new RoleAssignedEvent(userId, roleName));
    }

    async revokeRole(userId: string, roleId: string, tenantId?: string): Promise<void> {
        // 1. Update DB
        await this.userRepository.revokeRole(userId, roleId, tenantId);

        // 2. Invalidate Cache
        // [SAP-GRADE] Stateless Session - No Cache to Invalidate for now.
    }
}
