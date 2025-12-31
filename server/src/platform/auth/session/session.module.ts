import { Module, forwardRef } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { AuthModule } from '../auth.module';
import { PrismaService } from '../../../prisma.service';
import { DecisionModule } from '../../decision/decision.module';

@Module({
    imports: [forwardRef(() => AuthModule), DecisionModule],
    controllers: [SessionController],
    providers: [SessionService, PrismaService],
    exports: [SessionService]
})
export class SessionModule { }
