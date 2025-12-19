import { Injectable, OnModuleInit } from '@nestjs/common';
import { PermissionRegistry } from './permissions';

@Injectable()
export class PermissionService implements OnModuleInit {
    onModuleInit() {
        console.log('Permission Registry Loaded:', Object.keys(PermissionRegistry));
    }

    getAllPermissions() {
        return PermissionRegistry;
    }
}
