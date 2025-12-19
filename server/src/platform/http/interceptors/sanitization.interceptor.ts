
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as xss from 'xss';

@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => this.sanitize(data))
        );
    }

    private sanitize(data: any): any {
        if (typeof data === 'string') {
            return xss.filterXSS(data); // Strip XSS from string outputs
        }
        if (Array.isArray(data)) {
            return data.map(item => this.sanitize(item));
        }
        if (typeof data === 'object' && data !== null) {
            // Handle Date objects and nulls correctly
            if (data instanceof Date) return data;

            const sanitizedObject = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    sanitizedObject[key] = this.sanitize(data[key]);
                }
            }
            return sanitizedObject;
        }
        return data;
    }
}
