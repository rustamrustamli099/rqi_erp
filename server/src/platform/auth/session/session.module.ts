import { Module, forwardRef } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { AuthModule } from '../auth.module';
import { PrismaService } from '../../../prisma.service';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [SessionController],
    providers: [SessionService, PrismaService],
    exports: [SessionService]
})
export class SessionModule { }
