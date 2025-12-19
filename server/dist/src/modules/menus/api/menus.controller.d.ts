import { MenusUseCase } from '../application/menus.usecase';
export declare class MenusController {
    private menusUseCase;
    constructor(menusUseCase: MenusUseCase);
    getSidebar(req: any): Promise<({
        items: ({
            permission: {
                id: string;
                name: string | null;
                slug: string;
                description: string | null;
                module: string;
            } | null;
            children: ({
                permission: {
                    id: string;
                    name: string | null;
                    slug: string;
                    description: string | null;
                    module: string;
                } | null;
                children: ({
                    permission: {
                        id: string;
                        name: string | null;
                        slug: string;
                        description: string | null;
                        module: string;
                    } | null;
                } & {
                    id: string;
                    title: string;
                    icon: string | null;
                    path: string | null;
                    order: number;
                    menuId: string;
                    parentId: string | null;
                    permissionId: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                })[];
            } & {
                id: string;
                title: string;
                icon: string | null;
                path: string | null;
                order: number;
                menuId: string;
                parentId: string | null;
                permissionId: string | null;
                createdAt: Date;
                updatedAt: Date;
            })[];
        } & {
            id: string;
            title: string;
            icon: string | null;
            path: string | null;
            order: number;
            menuId: string;
            parentId: string | null;
            permissionId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
    } & {
        id: string;
        name: string;
        slug: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
}
