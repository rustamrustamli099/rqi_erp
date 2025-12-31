import { Module, Global } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { DecisionModule } from '../decision/decision.module';

@Global()
@Module({
    imports: [DecisionModule],
    controllers: [MenuController],
    providers: [MenuService],
    exports: [MenuService],
})
export class MenuModule { }
