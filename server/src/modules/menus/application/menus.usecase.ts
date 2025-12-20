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

    private filterMenu(items: MenuItem[], userPermissions: Set<string>): any[] {
        const filtered: any[] = [];

        for (const item of items) {
            // Check Permission
            const hasPermission = !item.permission || userPermissions.has(item.permission);

            if (hasPermission) {
                // If has children, filter them
                if (item.children) {
                    const filteredChildren = this.filterMenu(item.children, userPermissions);
                    // Only include if item has no children requirement OR has visible children
                    if (filteredChildren.length > 0 || !item.children.length) { // Keep parent if children exist or empty array allowed? Usually collapse empty parents.
                        // Let's keep parent if it has a permission itself, even if children are empty? 
                        // Or if it's a folder, hide if empty?
                        // Simple logic: include filtered children. 
                        filtered.push({ ...item, children: filteredChildren });
                    }
                } else {
                    filtered.push(item);
                }
            }
        }

        return filtered;
    }

    async createDefaultMenu() {
        // [DEPRECATED] DB Menu Seeding disabled.
        return;
    }
}
