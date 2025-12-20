
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';

@Controller('logs')
export class AuditController {

    @Post('ui-events')
    @UseGuards(JwtAuthGuard)
    async logUiEvent(@Body() body: any, @Request() req: any) {
        // Fire-and-forget logging
        console.log(`[UI-AUDIT] User:${req.user.id} Event:${body.eventType}`, body);

        // TODO: Persist to DB or send to ELK/Datadog
        return { success: true };
    }
}
