import { Module, Global, forwardRef } from '@nestjs/common';
import { CacheService } from './cache.service';
import { DecisionCacheService } from './decision-cache.service';
import { CacheInvalidationService } from './cache-invalidation.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Global Cache Module
 * 
 * PHASE 10.2: Provides CacheService across the application.
 * PHASE 10.4: Added DecisionCacheService and CacheInvalidationService.
 * 
 * Global: true - available everywhere without explicit imports.
 */
@Global()
@Module({
    imports: [
        forwardRef(() => AuthModule)  // For CachedEffectivePermissionsService
    ],
    providers: [
        CacheService,
        DecisionCacheService,
        CacheInvalidationService
    ],
    exports: [
        CacheService,
        DecisionCacheService,
        CacheInvalidationService
    ]
})
export class CacheModule { }
