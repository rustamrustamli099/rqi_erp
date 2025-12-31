import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ADMIN_MENU_TREE, MenuItem } from '../../../platform/menu/menu.definition';

@Injectable()
export class MenusUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async getSidebar(user: any) {
        // Source of Truth: Code (ADMIN_MENU_TREE)
        // Filtering: Code (Permissions)

        // 1. Owner Bypass
        if (user.isOwner) {
            return this.enrichMenu(ADMIN_MENU_TREE);
        }

        // 2. Permission Filtering
        const userPermissions = new Set<string>((user.permissions as string[]) || []);

        return this.filterMenu(ADMIN_MENU_TREE, userPermissions);
    }

    private enrichMenu(items: MenuItem[]): any[] {
        return items.map(item => ({
            ...item,
            children: item.children ? this.enrichMenu(item.children) : undefined
        }));
    }

    /**
     * SAP-GRADE MENU FILTER
     * 
     * SAP LAW:
     * - Parent visible = self.permission OR ANY(child.visible)
     * - Order-independent
     * - Parents can be permissionless
     */
    private filterMenu(items: MenuItem[], userPermissions: Set<string>): any[] {
        const filtered: any[] = [];

        for (const item of items) {
            // Check self permission
            const selfAllowed = !item.permission || userPermissions.has(item.permission);

            // Process children recursively FIRST (order-independent)
            let visibleChildren: any[] = [];
            if (item.children && item.children.length > 0) {
                visibleChildren = this.filterMenu(item.children, userPermissions);
            }

            // SAP LAW: visible = selfAllowed OR ANY(child.visible)
            const anyChildVisible = visibleChildren.length > 0;
            const isVisible = selfAllowed || anyChildVisible;

            if (isVisible) {
                filtered.push({
                    ...item,
                    children: visibleChildren.length > 0 ? visibleChildren : undefined
                });
            }
        }

        return filtered;
    }

    async createDefaultMenu() {
        // [DEPRECATED] DB Menu Seeding disabled.
        return;
    }
}
