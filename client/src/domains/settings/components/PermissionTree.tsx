
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/components/ui/button';

export interface PermissionNode {
    id: string; // "users.view"
    label: string;
    children?: PermissionNode[];
}

export const PERMISSION_TREE_MOCK: PermissionNode[] = [
    {
        id: 'system',
        label: 'System Administration',
        children: [
            {
                id: 'system.users', label: 'User Management', children: [
                    { id: 'system.users.view', label: 'View Users' },
                    { id: 'system.users.create', label: 'Create Users' },
                    { id: 'system.users.edit', label: 'Edit Users' },
                    { id: 'system.users.delete', label: 'Delete Users' },
                ]
            },
            {
                id: 'system.roles', label: 'Role Management', children: [
                    { id: 'system.roles.view', label: 'View Roles' },
                    { id: 'system.roles.manage', label: 'Manage Roles' },
                ]
            },
            {
                id: 'system.finance', label: 'Finance', children: [
                    { id: 'system.finance.view', label: 'View Financials' },
                ]
            },
        ]
    },
    {
        id: 'tenant',
        label: 'Tenant Management',
        children: [
            { id: 'tenant.create', label: 'Create Tenant' },
            { id: 'tenant.billing', label: 'Billing Access' },
        ]
    }
];

interface PermissionTreeProps {
    value: string[]; // Selected permission IDs
    onChange: (value: string[]) => void;
    readonly?: boolean;
}

const TreeNode = ({ node, selected, onToggle, level = 0 }: { node: PermissionNode, selected: string[], onToggle: (id: string, checked: boolean) => void, level?: number }) => {
    const [expanded, setExpanded] = useState(true);

    // Check state logic
    const isChecked = selected.includes(node.id);
    // Indeterminate logic could be added here if needed for partial children selection

    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="select-none">
            <div
                className={cn(
                    "flex items-center py-1 hover:bg-muted/50 rounded px-2 cursor-pointer transition-colors",
                )}
                style={{ paddingLeft: `${level * 1.5}rem` }}
            >
                {hasChildren ? (
                    <Button variant="ghost" size="icon" className="h-4 w-4 mr-1 p-0 hover:bg-transparent" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                        {expanded ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronRight className="h-4 w-4 opacity-50" />}
                    </Button>
                ) : <div className="w-5 mr-1" />}

                <Checkbox
                    id={node.id}
                    checked={isChecked}
                    onCheckedChange={(c) => onToggle(node.id, c as boolean)}
                    className="mr-2"
                />

                <Label htmlFor={node.id} className="cursor-pointer flex-1 font-normal" onClick={() => hasChildren && setExpanded(!expanded)}>
                    {node.label}
                    <span className="ml-2 text-xs text-muted-foreground opacity-50 font-mono">[{node.id}]</span>
                </Label>
            </div>

            {hasChildren && expanded && (
                <div className="border-l ml-4 border-muted/50">
                    {node.children!.map(child => (
                        <TreeNode key={child.id} node={child} selected={selected} onToggle={onToggle} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const PermissionTree = ({ value, onChange, readonly }: PermissionTreeProps) => {
    const handleToggle = (id: string, checked: boolean) => {
        if (readonly) return;

        let newValue = [...value];
        if (checked) {
            newValue.push(id);
        } else {
            newValue = newValue.filter(p => p !== id);
        }
        onChange(newValue);
    };

    return (
        <div className="border rounded-md p-4 bg-card max-h-[400px] overflow-y-auto">
            {PERMISSION_TREE_MOCK.map(node => (
                <TreeNode key={node.id} node={node} selected={value} onToggle={handleToggle} />
            ))}
        </div>
    );
};
