
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureFlagsService } from './feature-flags.service';
import { FEATURE_KEY } from './feature.decorator';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private featureFlagsService: FeatureFlagsService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredFeature = this.reflector.getAllAndOverride<string>(FEATURE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredFeature) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        // Assuming TenantContextGuard has already run and populated request.tenantId or user.tenantId
        const tenantId = request.tenantId || request.user?.tenantId;

        const isEnabled = await this.featureFlagsService.isEnabled(requiredFeature, tenantId);

        if (!isEnabled) {
            throw new ForbiddenException(`Feature '${requiredFeature}' is not enabled for this context.`);
        }

        return true;
    }
}
