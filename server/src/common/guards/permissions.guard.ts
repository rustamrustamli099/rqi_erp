import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
        if (!requiredPermissions) {
            return true; // No permissions required
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return false;
        }

        // 1. OWNER BYPASS (Strict Check as requested)
        const userRoles = (user as any).roles || [];
        if (userRoles.includes('owner') || userRoles.includes('superadmin')) {
            return true;
        }

        // 2. Load User Permissions from DB (if not in JWT)
        // Assuming JWT might not have full permission list to save size, we fetch/cache it.
        // For now, let's fetch roles->permissions.
        // In a real app, this should be cached.

        // We already have user.id. Let's fetch the user's roles and permissions.
        // Optimization: If permissions are in JWT, use them. 
        // But currently we only put roles in JWT.

        const userWithRoles = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!userWithRoles) return false;

        // Flatten permissions
        const userPermissionSlugs = new Set<string>();
        userWithRoles.roles.forEach(userRole => {
            // Traverse UserRole -> Role -> RolePermission -> Permission
            if (userRole.role && userRole.role.permissions) {
                userRole.role.permissions.forEach(rp => {
                    if (rp.permission) {
                        userPermissionSlugs.add(rp.permission.slug);
                    }
                });
            }
        });

        // 3. Check requirements
        const hasPermission = requiredPermissions.some(permission => userPermissionSlugs.has(permission));

        if (!hasPermission) {
            throw new ForbiddenException('Insufficient Permissions');
        }

        return true;
    }
}

export const RequirePermissions = (...permissions: string[]) => {
    return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
        Reflect.defineMetadata('permissions', permissions, descriptor!.value);
        return descriptor;
    };
};
