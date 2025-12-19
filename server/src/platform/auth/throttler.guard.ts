
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        // Rate limit by IP AND User ID if available (stricter)
        if (req.user && req.user.id) {
            return `${req.ip}-${req.user.id}`;
        }
        return req.ip;
    }
}
