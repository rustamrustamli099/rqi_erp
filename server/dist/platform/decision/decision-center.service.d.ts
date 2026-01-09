import { MenuItem } from '../menu/menu.definition';
export declare class DecisionCenterService {
    resolveNavigationTree(tree: MenuItem[], userPermissions: string[]): MenuItem[];
    private filterNodes;
    private resolveActionsForNode;
    resolveActions(userPermissions: string[]): string[];
    getCanonicalPath(resolvedTree: MenuItem[]): string | null;
    evaluateRoute(tree: MenuItem[], userPermissions: string[], path: string): boolean;
    private findPathInTree;
}
