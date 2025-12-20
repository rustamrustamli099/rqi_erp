
import { Injectable } from '@nestjs/common';
import { MenuItem } from './menu.definition';

@Injectable()
export class MenuService {

    /**
     * Recursively filters menu items based on user permissions.
     * @param menuItems The full menu tree or subtree
     * @param permissions The list of permissions the user possesses
     * @returns Filtered menu tree
     */
    filterMenu(menuItems: MenuItem[], permissions: string[]): MenuItem[] {
        return menuItems
            .filter(item => {
                // If no permission requirement, show it (or default to public)
                if (!item.permission) return true;
                // Check if user has the required permission
                return permissions.includes(item.permission);
            })
            .map(item => {
                // If item has children, recurse
                if (item.children && item.children.length > 0) {
                    const filteredChildren = this.filterMenu(item.children, permissions);

                    // Logic Decision: 
                    // 1. If parent is shown but all children are hidden, should parent be shown?
                    // SAP Style: Usually yes, but as empty folder or it hides. 
                    // Let's hide parent if all children are hidden to keep UI clean.
                    // UNLESS parent has a direct path action itself.

                    // If the item has a path, keep it even if children are gone.
                    // If the item is just a folder (no path), remove it if no children.

                    if (!item.path && filteredChildren.length === 0) {
                        return null;
                    }

                    return { ...item, children: filteredChildren };
                }
                return item;
            })
            .filter(Boolean) as MenuItem[]; // Remove nulls from map above
    }
}
