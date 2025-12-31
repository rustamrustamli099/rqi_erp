
import { Controller, Get, Res } from '@nestjs/common';
import { register, Registry, CollectFunction } from 'prom-client';
import type { Response } from 'express';

@Controller('metrics')
export class MetricsController {

    @Get()
    async getMetrics(@Res() res: Response) {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.end(metrics);
    }
}
