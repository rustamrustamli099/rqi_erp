
import { Module, Global } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { FeatureFlagGuard } from './feature-flags.guard';
import { RedisModule } from '../../platform/redis/redis.module';

@Global()
@Module({
    imports: [RedisModule],
    providers: [FeatureFlagsService, FeatureFlagGuard],
    exports: [FeatureFlagsService, FeatureFlagGuard],
})
export class FeatureFlagsModule { }
