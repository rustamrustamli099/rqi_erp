
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';

@Injectable()
export class TenantContextGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // 1. If user is authenticated, AUTHORITY on Tenant ID is the User Token.
        if (user && user.tenantId) {
            request.tenantId = user.tenantId;

            // 2. Scope Check: If URL has :tenantId, it MUST match User's Tenant ID
            const params = request.params;
            if (params && params.tenantId) {
                if (params.tenantId !== user.tenantId) {
                    throw new ForbiddenException('Access to other tenant scope denied');
                }
            }
        } else if (user && !user.tenantId) {
            // User exists but has no tenant (System Admin?)
            // Allow proceed, but request.tenantId is undefined (System Scope)
        }

        return true;
    }
}
