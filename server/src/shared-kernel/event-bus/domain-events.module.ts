import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DomainEventBus } from './event-bus.service';

@Global()
@Module({
    imports: [EventEmitterModule.forRoot()],
    providers: [DomainEventBus],
    exports: [DomainEventBus],
})
export class DomainEventsModule { }
