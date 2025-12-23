import { PermissionsService } from '../application/permissions.service';
import { PreviewPermissionsDto } from './dto/preview-permissions.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAll(): Promise<any[]>;
    preview(dto: PreviewPermissionsDto): Promise<{
        visibleMenus: import("../../../../../platform/menu/menu.definition").MenuItem[];
        visibleRoutes: string[];
        blockedRoutes: string[];
        effectivePermissions: string[];
        summary: {
            totalPermissions: number;
            byModule: {};
        };
        accessState: string;
    }>;
}
