import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * Global Cache Module
 * 
 * PHASE 10.2: Provides CacheService across the application.
 * Global: true - available everywhere without explicit imports.
 */
@Global()
@Module({
    providers: [CacheService],
    exports: [CacheService]
})
export class CacheModule { }
