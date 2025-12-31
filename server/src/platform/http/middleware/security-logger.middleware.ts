import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../../prisma.service';
import * as geoip from 'geoip-lite';

@Injectable()
export class SecurityLoggerMiddleware implements NestMiddleware {
    constructor(private readonly prisma: PrismaService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip, headers } = req;
        const userAgent = headers['user-agent'] || '';

        // Extract userId if available (e.g., from validated JWT in previous middleware/guard if applicable, 
        // but typically middleware runs before guards. If we need user info, we might need an interceptor or 
        // run this after auth. However, robust logging often logs anonymous traffic too.
        // For this specific requirement "user actions", we likely want to log AFTER AuthGuard.
        // But NestJS Middleware runs BEFORE Guards.
        // OPTION: Use an Interceptor instead for logging "User Actions".

        // Changing approach to Interceptor for better access to User object.
        // keeping this file as a placeholder or valid middleware if we change strategy.

        // ACTUALLY, let's make this an Interceptor called `SecurityLoggerInterceptor`.
        // But for now, I will write the Interceptor code here and rename the file content conceptually.

        next();
    }
}
