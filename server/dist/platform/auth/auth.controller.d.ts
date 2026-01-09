import { AuthService } from './auth.service';
import { MfaService } from './mfa.service';
import { EffectivePermissionsService } from './effective-permissions.service';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
export declare class AuthController {
    private authService;
    private mfaService;
    private effectivePermissionsService;
    constructor(authService: AuthService, mfaService: MfaService, effectivePermissionsService: EffectivePermissionsService);
    login(req: any, response: Response): Promise<{
        mfaRequired: boolean;
        userId: any;
        access_token?: undefined;
        user?: undefined;
    } | {
        access_token: string;
        user: any;
        mfaRequired?: undefined;
        userId?: undefined;
    }>;
    logout(req: any, response: Response): Promise<{
        message: string;
    }>;
    verifyMfaLogin(body: {
        userId: string;
        token: string;
    }, response: Response): Promise<{
        access_token: string;
    }>;
    refresh(req: any, response: Response): Promise<{
        access_token: string;
    }>;
    generateMfa(req: any): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    enableMfa(req: any, body: {
        token: string;
        secret: string;
    }): Promise<{
        message: string;
    }>;
    register(createUserDto: Prisma.UserCreateInput): Promise<{
        message: string;
    }>;
    getProfile(req: any): any;
    getMe(req: any): Promise<any>;
    impersonate(req: any, body: {
        userId: string;
    }, response: Response): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            permissions: never[];
        };
    }>;
}
