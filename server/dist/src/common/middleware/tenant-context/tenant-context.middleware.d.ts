import { NestMiddleware } from '@nestjs/common';
export declare class TenantContextMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void): void;
}
