
import { useState, useMemo, useEffect } from "react"
import { ChevronRight, ChevronDown, Check, Shield, CircleSlash, BoxSelect } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/shared/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover"
import { Separator } from "@/shared/components/ui/separator"
import { Checkbox } from "@/shared/components/ui/checkbox"

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

export interface PermissionNode {
    id: string
    label: string
    scope?: "SYSTEM" | "TENANT" | "COMMON"
    children?: PermissionNode[]
    isDangerous?: boolean
}

interface PermissionEditorProps {
    permissions: PermissionNode[]
    selectedSlugs: string[]
    onChange: (slugs: string[]) => void
}

// ----------------------------------------------------------------------
// UTILS
// ----------------------------------------------------------------------

// Get all leaf IDs (actual permissions) from a node
const getAllLeafIds = (node: PermissionNode): string[] => {
    if (!node.children || node.children.length === 0) {
        return [node.id]
    }
    return node.children.flatMap(getAllLeafIds)
}

// Check coverage: NONE | PARTIAL | FULL
type CoverageState = "NONE" | "PARTIAL" | "FULL"

const getCoverage = (node: PermissionNode, selectedSlugs: string[]): CoverageState => {
    const leaves = getAllLeafIds(node)
    if (leaves.length === 0) return "NONE"

    const selectedCount = leaves.filter(id => selectedSlugs.includes(id)).length

    if (selectedCount === 0) return "NONE"
    if (selectedCount === leaves.length) return "FULL"
    return "PARTIAL"
}

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

export function PermissionEditor({ permissions, selectedSlugs, onChange }: PermissionEditorProps) {
    // We assume the root is a list of modules. We render a group for each.
    return (
        <div className="space-y-4 border rounded-lg p-4 bg-slate-50/50">

            {permissions.map(node => (
                <PermissionGroup
                    key={node.id}
                    node={node}
                    selectedSlugs={selectedSlugs}
                    onChange={onChange}
                    level={0}
                />
            ))}

            {permissions.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    İcazə strukturu yüklənməyib.
                </div>
            )}
        </div>
    )
}

interface PermissionGroupProps {
    node: PermissionNode
    selectedSlugs: string[]
    onChange: (slugs: string[]) => void
    level: number
}

function PermissionGroup({ node, selectedSlugs, onChange, level }: PermissionGroupProps) {
    const isLeaf = !node.children || node.children.length === 0
    const [isOpen, setIsOpen] = useState(level < 1) // Default open top level

    const leaves = useMemo(() => getAllLeafIds(node), [node])
    const coverage = getCoverage(node, selectedSlugs)

    // ACTIONS


    // For Leaf nodes: Toggle single permission
    const toggleLeaf = () => {
        if (selectedSlugs.includes(node.id)) {
            onChange(selectedSlugs.filter(s => s !== node.id))
        } else {
            onChange([...selectedSlugs, node.id])
        }
    }

    if (isLeaf) {
        return (
            <div className={cn(
                "flex items-center gap-2 p-2 rounded hover:bg-slate-100 transition-colors cursor-pointer",
                level > 0 && "ml-4 border-l pl-4"
            )} onClick={(e) => {
                e.preventDefault()
                toggleLeaf()
            }}>
                <Checkbox
                    checked={selectedSlugs.includes(node.id)}
                    onCheckedChange={() => toggleLeaf()}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <span className={cn("text-sm", node.isDangerous && "text-red-600 font-medium")}>
                    {node.label}
                </span>
                {node.isDangerous && <Badge variant="destructive" className="text-[10px] h-4 px-1">Riskli</Badge>}
            </div>
        )
    }

    return (
        <div className={cn("space-y-1 my-1", level > 0 && "ml-4")}>
            {/* Header / Control Row */}
            <div className={cn(
                "flex items-center justify-between p-2 rounded-md border bg-white shadow-sm transition-all",
                coverage === "FULL" && "border-green-200 bg-green-50/30",
                coverage === "PARTIAL" && "border-amber-200 bg-amber-50/30"
            )}>
                <div className="flex items-center gap-2 flex-1 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <span className="font-semibold text-sm select-text">{node.label}</span>

                    {/* Status Badge */}
                    {coverage === "FULL" && <Badge className="bg-green-600 text-[10px] hover:bg-green-700">TAM İCAZƏ</Badge>}
                    {coverage === "PARTIAL" && <Badge variant="secondary" className="text-amber-700 bg-amber-100 text-[10px]">XÜSUSİ (CUSTOM)</Badge>}
                    {coverage === "NONE" && <Badge variant="outline" className="text-slate-400 text-[10px]">GİZLİ</Badge>}
                </div>

                {/* MultiSelect Control - Strict API Signature */}
                <PermissionMultiSelect
                    node={node}
                    selectedPermissions={selectedSlugs}
                    onChange={onChange}
                />
            </div>

            {/* Children Recursive */}
            {isOpen && (
                <div className="pl-2 border-l-2 border-slate-100 ml-3 space-y-1">
                    {node.children!.map(child => (
                        <PermissionGroup
                            key={child.id}
                            node={child}
                            onChange={onChange}
                            selectedSlugs={selectedSlugs}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ----------------------------------------------------------------------
// STRICT MULTISELECT COMPONENT
// ----------------------------------------------------------------------

interface PermissionMultiSelectProps {
    node: PermissionNode
    selectedPermissions: string[]
    onChange: (updated: string[]) => void
}

export function PermissionMultiSelect({ node, selectedPermissions, onChange }: PermissionMultiSelectProps) {
    const [open, setOpen] = useState(false)

    // Derived State
    const leaves = useMemo(() => getAllLeafIds(node), [node])
    const coverage = getCoverage(node, selectedPermissions)

    // Handlers
    const handleFullAccess = () => {
        // Select all permissions under this node
        const newSet = new Set([...selectedPermissions, ...leaves])
        onChange(Array.from(newSet))
        setOpen(false)
    }

    const handleHide = () => {
        // Deselect all permissions under this node
        const newSlugs = selectedPermissions.filter(s => !leaves.includes(s))
        onChange(newSlugs)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-slate-500 font-normal">
                    Seçim <ChevronDown className="h-3 w-3" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0" align="end">
                <Command>
                    <CommandList>
                        <CommandGroup>
                            <CommandItem onSelect={handleFullAccess} className="cursor-pointer gap-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">TAM İCAZƏ</span>
                                    <span className="text-[10px] text-muted-foreground">Bütün alt icazələri seç</span>
                                </div>
                                {coverage === "FULL" && <Check className="ml-auto h-3 w-3" />}
                            </CommandItem>

                            <CommandSeparator className="my-1" />

                            <CommandItem onSelect={handleHide} className="cursor-pointer gap-2">
                                <CircleSlash className="h-4 w-4 text-slate-400" />
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">GİZLƏT</span>
                                    <span className="text-[10px] text-muted-foreground">Bütün icazələri ləğv et</span>
                                </div>
                                {coverage === "NONE" && <Check className="ml-auto h-3 w-3" />}
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
