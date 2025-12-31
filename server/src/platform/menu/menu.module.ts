import { Module, Global, forwardRef } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [MenuController],
    providers: [MenuService],
    exports: [MenuService],
})
export class MenuModule { }
