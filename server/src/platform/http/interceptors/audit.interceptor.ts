import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, user, ip } = req;

        // Only log mutations (POST, PUT, PATCH, DELETE) to avoid noise
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle().pipe(
                tap(async () => {
                    if (user) {
                        // Mask sensitive data
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { password, ...safeBody } = req.body || {};

                        await this.auditService.logAction({
                            userId: user.userId || user.id, // Support both JWT payload (sub/userId) and User Entity (id)
                            action: method,
                            module: url.split('/')[2] || 'unknown',
                            method: method,
                            endpoint: url,
                            tenantId: user.tenantId,
                            branchId: user.branchId || null,
                            ipAddress: ip,
                            details: safeBody,
                        });
                    }
                }),
            );
        }

        return next.handle();
    }
}
