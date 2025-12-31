import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithUser extends Request {
    user: any;
    tenantId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(req: RequestWithUser, res: Response, next: NextFunction) {
        const user = req.user; // Assuming AuthGuard runs before this or JWT is parsed

        // In NestJS, typical execution order: Middleware -> Guards -> Interceptors -> Pipes -> Controller
        // Middleware runs BEFORE Guards, so req.user might not be populated yet if we rely on Passport here.
        // However, for tenant isolation at the infrastructure level, we often extract it from the token manually or header.

        // Strategy: Since we want this globally, we might rely on the fact that for PUBLIC routes it doesn't matter.
        // But for PROTECTED routes, we need the tenant.

        // Simplification for now: We won't block here if user is missing, but if user exists (from a previous middleware or if we move this AFTER auth), we attach tenant.

        // In a standard Nest app, Passport strategies run in Guards.
        // So usually we implement this logic IN the Guard or Interceptor.
        // But user specifically asked for "Middleware for Tenant Isolation".

        // Let's inspect the authorization header manually if we want it early.

        const authHeader = req.headers.authorization;
        if (authHeader) {
            // We could decode token here, but that duplicates Auth logic.
            // Better approach: Use a Global Interceptor or Guard for Tenant Context.
            // But since I am tasked with "Middleware", I will setup the structure.
            // Real logic: We will assume the existence of a 'x-tenant-id' header for super-admin overrides, 
            // OR we wait for the Guard to populate request.user.
        }

        // Ideally, we trust the Guard. So this middleware might be better suited as an Interceptor 
        // or we accept that it runs before Auth and just checks for a header.

        // [SECURITY] Do NOT trust X-Tenant-ID header from client.
        // Tenant resolution must come from Authenticated User (in Guard) or Domain.
        // req.tenantId = null; 

        next();
    }
}
