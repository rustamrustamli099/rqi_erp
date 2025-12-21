import { PermissionsService } from './permissions.service';
import { PreviewPermissionsDto } from './dto/preview-permissions.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    preview(dto: PreviewPermissionsDto): Promise<{
        visibleMenus: import("../../../platform/menu/menu.definition").MenuItem[];
        visibleRoutes: string[];
        blockedRoutes: never[];
        effectivePermissions: string[];
    }>;
}
