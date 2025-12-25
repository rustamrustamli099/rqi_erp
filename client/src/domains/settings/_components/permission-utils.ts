
// permission-utils.ts
export interface PermissionNode {
    id: string
    label: string
    description?: string
    isDangerous?: boolean
    scope?: 'SYSTEM' | 'TENANT' | 'COMMON'
    children?: PermissionNode[]
}

export const getLeafSlugs = (node: PermissionNode): string[] => {
    if (!node.children || node.children.length === 0) {
        return [node.id]
    }
    return node.children.flatMap(getLeafSlugs)
}
