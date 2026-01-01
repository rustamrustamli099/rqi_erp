
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SafeJsonSerializerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(SafeJsonSerializerInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(map(data => {
            // We only need to "sanitize" if it's going to be serialized.
            // NestJS will serialize it later. But if we want to catch circular deps, we can do it here
            // by forcing a stringify/parse cycle or just intercepting the response logic?
            // Actually, we can just let it pass, BUT if it crashes, we can't catch it here easily in map.
            // However, we can "clean" the data using the weakset approach.
            return this.safeSanitize(data);
        }));
    }

    private safeSanitize(obj: any, seen = new WeakSet()): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (seen.has(obj)) {
            return '[Circular]';
        }

        seen.add(obj);

        if (Array.isArray(obj)) {
            return obj.map(item => this.safeSanitize(item, seen));
        }

        const cleaned: any = {};
        for (const key of Object.keys(obj)) {
            cleaned[key] = this.safeSanitize(obj[key], seen);
        }

        return cleaned;
    }
}
