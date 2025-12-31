import { Module, Global, forwardRef } from '@nestjs/common';
import { DecisionCenterService } from './decision-center.service';
import { DecisionOrchestrator } from './decision.orchestrator';
import { AuthModule } from '../auth/auth.module'; // Needed for EffectivePermissionsService

@Global()
@Module({
    imports: [forwardRef(() => AuthModule)],
    providers: [DecisionCenterService, DecisionOrchestrator],
    exports: [DecisionCenterService, DecisionOrchestrator]
})
export class DecisionModule { }
