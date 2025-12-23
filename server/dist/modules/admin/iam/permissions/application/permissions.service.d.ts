import { PreviewPermissionsDto } from '../api/dto/preview-permissions.dto';
import { IRoleRepository } from '../../../../../platform/identity/domain/role.repository.interface';
import { MenuService } from '../../../../../platform/menu/menu.service';
export declare class PermissionsService {
    private readonly menuService;
    private readonly roleRepository;
    constructor(menuService: MenuService, roleRepository: IRoleRepository);
    previewPermissions(dto: PreviewPermissionsDto): Promise<{
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
    findAll(): Promise<any[]>;
    private flattenPermissionsMap;
    private getAllRoutes;
}
