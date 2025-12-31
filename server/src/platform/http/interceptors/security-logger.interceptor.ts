import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../../prisma.service';
import * as geoip from 'geoip-lite';

@Injectable()
export class SecurityLoggerInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, headers, user } = request;

        return next.handle().pipe(
            tap(async () => {
                if (user && user.id) {
                    const geo = geoip.lookup(ip as string);
                    const location = geo ? `${geo.country}, ${geo.city}` : 'Unknown';
                    const action = `${method} ${url}`;

                    // Avoid logging frequent GET requests if desired, but user asked for "ALL movements"
                    // We can filter out some noise if needed.

                    try {
                        await this.prisma.securityLog.create({
                            data: {
                                userId: user.id,
                                action: action,
                                ipAddress: (ip as string) || 'unknown',
                                userAgent: headers['user-agent'],
                                device: headers['sec-ch-ua-platform'] || 'unknown', // basic device hint
                                location: location,
                            },
                        });
                    } catch (error) {
                        console.error('Failed to log security event:', error);
                    }
                }
            }),
        );
    }
}
