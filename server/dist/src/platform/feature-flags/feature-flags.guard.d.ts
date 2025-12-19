import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureFlagsService } from './feature-flags.service';
export declare class FeatureFlagGuard implements CanActivate {
    private reflector;
    private featureFlagsService;
    constructor(reflector: Reflector, featureFlagsService: FeatureFlagsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
