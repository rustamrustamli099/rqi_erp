import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export interface RequestWithUser extends Request {
    user: any;
    tenantId?: string;
}
export declare class TenantMiddleware implements NestMiddleware {
    use(req: RequestWithUser, res: Response, next: NextFunction): void;
}
