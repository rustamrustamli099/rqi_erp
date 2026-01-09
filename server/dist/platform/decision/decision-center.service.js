"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionCenterService = void 0;
const common_1 = require("@nestjs/common");
const action_registry_1 = require("./action.registry");
let DecisionCenterService = class DecisionCenterService {
    resolveNavigationTree(tree, userPermissions) {
        const permissionSet = new Set(userPermissions);
        return this.filterNodes(tree, permissionSet);
    }
    filterNodes(nodes, permissionSet) {
        const resolved = [];
        for (const node of nodes) {
            if (node.permission && !permissionSet.has(node.permission)) {
                continue;
            }
            let visibleChildren = [];
            if (node.children && node.children.length > 0) {
                visibleChildren = this.filterNodes(node.children, permissionSet);
            }
            const isContainer = node.children && node.children.length > 0;
            const hasExplicitPermission = !!node.permission;
            if (isContainer && !hasExplicitPermission) {
                if (visibleChildren.length === 0) {
                    continue;
                }
            }
            const actions = this.resolveActionsForNode(node.id, permissionSet);
            const resolvedNode = {
                ...node,
                children: visibleChildren.length > 0 ? visibleChildren : undefined,
                actions
            };
            resolved.push(resolvedNode);
        }
        return resolved;
    }
    resolveActionsForNode(nodeId, permissionSet) {
        const config = action_registry_1.ACTION_PERMISSIONS_REGISTRY.find(c => c.entityKey === nodeId);
        if (!config)
            return undefined;
        const resolvedActions = config.actions.map(a => ({
            actionKey: a.actionKey,
            state: permissionSet.has(a.permissionSlug) ? 'enabled' : 'hidden'
        })).filter(a => a.state !== 'hidden');
        if (resolvedActions.length === 0)
            return undefined;
        const toolbarKeys = ['create', 'export_to_excel', 'submit', 'approve', 'reject', 'import', 'manage_seats'];
        const rowKeys = ['update', 'delete', 'read', 'change_status', 'impersonate', 'view_audit', 'cancel'];
        return {
            actions: resolvedActions,
            byContext: {
                toolbar: resolvedActions.filter(a => toolbarKeys.includes(a.actionKey)),
                row: resolvedActions.filter(a => rowKeys.includes(a.actionKey) || !toolbarKeys.includes(a.actionKey))
            }
        };
    }
    resolveActions(userPermissions) {
        return userPermissions;
    }
    getCanonicalPath(resolvedTree) {
        for (const node of resolvedTree) {
            if (node.path && !node.children) {
                return node.path;
            }
            if (node.children && node.children.length > 0) {
                const childPath = this.getCanonicalPath(node.children);
                if (childPath)
                    return childPath;
            }
        }
        return null;
    }
    evaluateRoute(tree, userPermissions, path) {
        const resolvedTree = this.resolveNavigationTree(tree, userPermissions);
        return this.findPathInTree(resolvedTree, path);
    }
    findPathInTree(nodes, path) {
        for (const node of nodes) {
            if (node.path === path)
                return true;
            if (node.children) {
                if (this.findPathInTree(node.children, path))
                    return true;
            }
        }
        return false;
    }
};
exports.DecisionCenterService = DecisionCenterService;
exports.DecisionCenterService = DecisionCenterService = __decorate([
    (0, common_1.Injectable)()
], DecisionCenterService);
//# sourceMappingURL=decision-center.service.js.map