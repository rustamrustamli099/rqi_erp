import { MenuService } from './menu.service';
import { EffectivePermissionsService } from '../auth/effective-permissions.service';
export declare class MenuController {
    private readonly menuService;
    private readonly effectivePermissionsService;
    constructor(menuService: MenuService, effectivePermissionsService: EffectivePermissionsService);
    getMyMenu(req: any): Promise<import("./menu.definition").MenuItem[]>;
}
