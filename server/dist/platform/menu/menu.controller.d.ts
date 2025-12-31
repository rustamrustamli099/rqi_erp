import { MenuService } from './menu.service';
import { PermissionCacheService } from '../auth/permission-cache.service';
export declare class MenuController {
    private readonly menuService;
    private readonly permissionCache;
    constructor(menuService: MenuService, permissionCache: PermissionCacheService);
    getMyMenu(req: any): Promise<import("./menu.definition").MenuItem[]>;
}
