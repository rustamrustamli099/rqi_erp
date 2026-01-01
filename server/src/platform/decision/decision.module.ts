import { Module, Global, forwardRef } from '@nestjs/common';
import { DecisionCenterService } from './decision-center.service';
import { DecisionOrchestrator } from './decision.orchestrator';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';

@Global()
@Module({
    imports: [
        forwardRef(() => AuthModule),
        CacheModule  // PHASE 10.3: For decision result caching
    ],
    providers: [DecisionCenterService, DecisionOrchestrator],
    exports: [DecisionCenterService, DecisionOrchestrator]
})
export class DecisionModule { }

