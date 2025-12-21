import { MenusUseCase } from '../application/menus.usecase';
export declare class MenusController {
    private menusUseCase;
    constructor(menusUseCase: MenusUseCase);
    getSidebar(req: any): Promise<any[]>;
}
