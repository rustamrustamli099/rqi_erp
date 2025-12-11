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
        // 1. OWNER BYPASS (Strict Check as requested)
        const userRole = (user as any).role;
        if (userRole === 'owner' || userRole === 'superadmin') {
            return true;
        }

        // 2. Load User Permissions from DB (if not in JWT)
        // We already have user.id. Let's fetch the user's role and permissions.

        const userWithRole = await this.prisma.user.findUnique({
            where: { id: user.id },
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
        });

        if (!userWithRole || !userWithRole.role) return false;

        // Flatten permissions
        const userPermissionSlugs = new Set<string>();

        if (userWithRole.role.permissions) {
            userWithRole.role.permissions.forEach(rp => {
                if (rp.permission) {
                    userPermissionSlugs.add(rp.permission.slug);
                }
            });
        }

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
