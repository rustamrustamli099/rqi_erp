import { useState, useMemo, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChevronRight, ChevronDown, Check, Minus, Search, AlertTriangle, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

// --- Types ---

export interface PermissionNode {
    id: string // Slug for leaf, or unique key for group
    label: string
    description?: string
    isDangerous?: boolean
    children?: PermissionNode[]
}

interface PermissionTreeEditorProps {
    permissions: PermissionNode[]
    selectedSlugs: string[]
    onChange: (slugs: string[]) => void
    className?: string
}

// --- Helper Functions ---

const getLeafSlugs = (node: PermissionNode): string[] => {
    if (!node.children || node.children.length === 0) {
        return [node.id]
    }
    return node.children.flatMap(getLeafSlugs)
}

// Flatten tree for searching
const flattenTree = (nodes: PermissionNode[]): PermissionNode[] => {
    let flat: PermissionNode[] = []
    nodes.forEach(node => {
        flat.push(node)
        if (node.children) {
            flat = [...flat, ...flattenTree(node.children)]
        }
    })
    return flat
}

// Check status logic
type CheckedState = "checked" | "unchecked" | "indeterminate"

const getNodeState = (node: PermissionNode, selectedSlugs: string[]): CheckedState => {
    // Leaf node
    if (!node.children || node.children.length === 0) {
        return selectedSlugs.includes(node.id) ? "checked" : "unchecked"
    }

    // Group node
    const leafSlugs = getLeafSlugs(node)
    const checkedLeaves = leafSlugs.filter(slug => selectedSlugs.includes(slug))

    if (checkedLeaves.length === 0) return "unchecked"
    if (checkedLeaves.length === leafSlugs.length) return "checked"
    return "indeterminate"
}

// --- Components ---

function PermissionRow({
    node,
    selectedSlugs,
    onToggle,
    level = 0,
    searchTerm = ""
}: {
    node: PermissionNode
    selectedSlugs: string[]
    onToggle: (node: PermissionNode, currentState: CheckedState) => void
    level?: number
    searchTerm?: string
}) {
    const [isOpen, setIsOpen] = useState(true)
    const hasChildren = node.children && node.children.length > 0
    const state = getNodeState(node, selectedSlugs)

    // Filter logic: If search term exists, only show if self or children match
    const matchesSearch = useMemo(() => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        const selfMatch = node.label.toLowerCase().includes(term) || (node.description?.toLowerCase().includes(term))
        if (selfMatch) return true
        // Check children
        if (node.children) {
            const childMatch = node.children.some(c => {
                // Simple check if any descendant matches (this is recursive in full tree but simplified here for prop drilling)
                // For now, we rely on the parent ensuring this node is rendered only if relevant.
                return true // Logic handled by parent map usually, but here we construct logical tree
            })
            // Re-implement search deep check would be expensive here. 
            // Better strategy: Filter the TREE data before rendering.
            return true
        }
        return false
    }, [node, searchTerm])


    const handleCheckboxChange = () => {
        onToggle(node, state)
    }

    // Icon for dangerous permissions
    const DangerousIcon = () => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <ShieldAlert className="w-4 h-4 text-amber-500 ml-2" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Bu riskli icazədir. Ehtiyatla verin.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <div
                className={cn(
                    "flex items-center py-2 px-2 hover:bg-muted/50 rounded-md transition-colors group",
                    level > 0 && "ml-4 border-l pl-4"
                )}
            >
                {/* Expand Toggle */}
                {hasChildren ? (
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 mr-2 shrink-0">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </CollapsibleTrigger>
                ) : (
                    <div className="w-6 mr-2 shrink-0" /> // Spacer
                )}

                {/* Checkbox */}
                <div
                    className={cn(
                        "flex items-center justify-center h-4 w-4 rounded-sm border border-primary mr-3 cursor-pointer transition-colors",
                        state === "checked" ? "bg-primary text-primary-foreground" :
                            state === "indeterminate" ? "bg-primary/50 text-primary-foreground" : "bg-transparent"
                    )}
                    onClick={handleCheckboxChange}
                >
                    {state === "checked" && <Check className="h-3 w-3" />}
                    {state === "indeterminate" && <Minus className="h-3 w-3" />}
                </div>

                {/* Label & Meta */}
                <div className="flex-1 flex items-center justify-between cursor-pointer" onClick={handleCheckboxChange}>
                    <div className="flex items-center">
                        <span className={cn("text-sm font-medium", searchTerm && node.label.toLowerCase().includes(searchTerm.toLowerCase()) && "bg-yellow-100 dark:bg-yellow-900/40")}>
                            {node.label}
                        </span>
                        {node.isDangerous && <DangerousIcon />}
                    </div>

                    {node.description && (
                        <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[300px] ml-4">
                            {node.description}
                        </span>
                    )}
                </div>
            </div>

            {hasChildren && (
                <CollapsibleContent>
                    <div className="mt-1">
                        {node.children!.map(child => (
                            <PermissionRow
                                key={child.id}
                                node={child}
                                selectedSlugs={selectedSlugs}
                                onToggle={onToggle}
                                level={level + 1}
                                searchTerm={searchTerm}
                            />
                        ))}
                    </div>
                </CollapsibleContent>
            )}
        </Collapsible>
    )
}

// --- Main Component ---

export function PermissionTreeEditor({ permissions, selectedSlugs, onChange, className }: PermissionTreeEditorProps) {
    const [searchTerm, setSearchTerm] = useState("")

    // Toggle Logic
    const handleToggle = (node: PermissionNode, currentState: CheckedState) => {
        let newSlugs = [...selectedSlugs]
        const targetSlugs = getLeafSlugs(node)

        if (currentState === "unchecked" || currentState === "indeterminate") {
            // Select all children
            // Add any that aren't already there
            targetSlugs.forEach(slug => {
                if (!newSlugs.includes(slug)) newSlugs.push(slug)
            })
        } else {
            // Deselect all children
            newSlugs = newSlugs.filter(slug => !targetSlugs.includes(slug))
        }

        onChange(newSlugs)
    }

    // Filtering logic
    const filteredPermissions = useMemo(() => {
        if (!searchTerm) return permissions

        const filterNode = (node: PermissionNode): PermissionNode | null => {
            const selfMatch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) || (node.description?.toLowerCase().includes(searchTerm.toLowerCase()))

            let filteredChildren: PermissionNode[] = []
            if (node.children) {
                filteredChildren = node.children.map(filterNode).filter(Boolean) as PermissionNode[]
            }

            if (selfMatch || filteredChildren.length > 0) {
                return { ...node, children: filteredChildren.length > 0 ? filteredChildren : undefined }
            }
            return null
        }

        return permissions.map(filterNode).filter(Boolean) as PermissionNode[]
    }, [permissions, searchTerm])

    return (
        <div className={cn("flex flex-col space-y-4", className)}>
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="İcazələri axtar (ad, təsvir...)"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tree */}
            <div className="border rounded-md p-4 min-h-[300px] max-h-[600px] overflow-y-auto bg-card">
                {filteredPermissions.length > 0 ? (
                    filteredPermissions.map(node => (
                        <PermissionRow
                            key={node.id}
                            node={node}
                            selectedSlugs={selectedSlugs}
                            onToggle={handleToggle}
                            searchTerm={searchTerm}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Search className="h-10 w-10 mb-4 opacity-20" />
                        <p>Heç nə tapılmadı</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Seçilib: {selectedSlugs.length} icazə</span>
                <div className="flex gap-4">
                    <span className="flex items-center"><div className="w-3 h-3 bg-primary rounded-sm mr-1" /> Seçilib</span>
                    <span className="flex items-center"><div className="w-3 h-3 bg-primary/50 rounded-sm mr-1" /> Qismən</span>
                    <span className="flex items-center"><div className="w-3 h-3 border border-primary rounded-sm mr-1" /> Boş</span>
                </div>
            </div>
        </div>
    )
}
