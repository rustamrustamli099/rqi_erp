
import { Injectable } from '@nestjs/common';
import { MenuItem } from './menu.definition';

@Injectable()
export class MenuService {

    /**
     * SAP-GRADE MENU FILTER
     * 
     * SAP LAW:
     * - Parent visible = self.permission OR ANY(child.visible)
     * - Order-independent
     * - Parents can be permissionless
     * 
     * @param menuItems The full menu tree or subtree
     * @param permissions The list of permissions the user possesses
     * @returns Filtered menu tree
     */
    filterMenu(menuItems: MenuItem[], permissions: string[]): MenuItem[] {
        return menuItems
            .map(item => {
                // Check self permission
                const selfAllowed = !item.permission || permissions.includes(item.permission);

                // Process children recursively FIRST (order-independent)
                let visibleChildren: MenuItem[] = [];
                if (item.children && item.children.length > 0) {
                    visibleChildren = this.filterMenu(item.children, permissions);
                }

                // SAP LAW: visible = selfAllowed OR ANY(child.visible)
                const anyChildVisible = visibleChildren.length > 0;
                const isVisible = selfAllowed || anyChildVisible;

                if (!isVisible) {
                    return null;
                }

                return {
                    ...item,
                    children: visibleChildren.length > 0 ? visibleChildren : undefined
                };
            })
            .filter(Boolean) as MenuItem[];
    }
}
