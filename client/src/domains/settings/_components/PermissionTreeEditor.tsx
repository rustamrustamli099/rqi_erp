import { useState, useMemo } from "react"
import { Check, ChevronRight, ChevronDown, EyeOff, ShieldAlert, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { MultiSelect } from "@/shared/components/ui/multi-select"
import {
    Collapsible,
    CollapsibleContent,
} from "@/shared/components/ui/collapsible"

import { getLeafSlugs } from "./permission-utils"
import type { PermissionNode } from "./permission-utils"

interface PermissionTreeEditorProps {
    permissions: PermissionNode[]
    selectedSlugs: string[]
    onChange: (slugs: string[]) => void
    className?: string
}


function PermissionRow({
    node,
    selectedSlugs,
    onChange,
    level = 0,
    searchTerm = ""
}: {
    node: PermissionNode
    selectedSlugs: string[]
    onChange: (slugs: string[]) => void
    level?: number
    searchTerm?: string
}) {
    // Determine if we should be open by default
    // SAP-GRADE: All accordions CLOSED by default for better UX
    const [isOpen, setIsOpen] = useState(!!searchTerm)

    const hasChildren = node.children && node.children.length > 0
    // A node is a "Leaf Cluster" if it has children, but those children are the actual leaves (no grandchildren)
    const isLeafCluster = hasChildren && node.children!.every(c => !c.children || c.children.length === 0)

    const leafSlugs = useMemo(() => getLeafSlugs(node), [node])
    const selectedCount = leafSlugs.filter(s => selectedSlugs.includes(s)).length

    // Status Logic
    const isFullAccess = selectedCount === leafSlugs.length && leafSlugs.length > 0
    const isHidden = selectedCount === 0

    // Handlers
    const handleFullAccess = (e: React.MouseEvent) => {
        e.stopPropagation()
        const newSlugs = new Set([...selectedSlugs, ...leafSlugs])
        onChange(Array.from(newSlugs))
    }

    const handleHidden = (e: React.MouseEvent) => {
        e.stopPropagation()
        // Just clear the selection for this node's leaves, DON'T disable
        const newSlugs = selectedSlugs.filter(s => !leafSlugs.includes(s))
        onChange(newSlugs)
    }

    // Search Logic
    const matchesSearch = useMemo(() => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        const selfMatch = node.label.toLowerCase().includes(term) || (node.description?.toLowerCase().includes(term))
        if (selfMatch) return true
        if (node.children) {
            return node.children.some(c => JSON.stringify(c).toLowerCase().includes(term))
        }
        return false
    }, [node, searchTerm])

    if (!matchesSearch) return null

    // --- CASE 1: LEAF CLUSTER (Smart MultiSelect - NO ACCORDION) ---
    if (isLeafCluster) {
        const realOptions = node.children!.map(c => ({ label: c.label, value: c.id }))
        const smartOptions = [
            { label: "✅ Tam İcazə", value: "__ALL__" },
            { label: "🚫 Gizlət", value: "__NONE__" },
            ...realOptions
        ]

        const clusterSelection = [
            ...(isFullAccess ? ["__ALL__"] : []),
            ...selectedSlugs.filter(s => realOptions.some(o => o.value === s))
        ]

        const handleSmartChange = (values: string[]) => {
            const hasAll = values.includes("__ALL__")
            const hasNone = values.includes("__NONE__")

            let newClusterSlugs: string[] = []

            if (hasAll && !isFullAccess) {
                newClusterSlugs = realOptions.map(o => o.value)
            } else if (isFullAccess && !hasAll && !hasNone) {
                newClusterSlugs = []
            } else if (hasNone && !isHidden) {
                newClusterSlugs = []
            } else {
                newClusterSlugs = values.filter(v => v !== "__ALL__" && v !== "__NONE__")
            }

            // --- AUTO-READ LOGIC (Frontend UX) ---
            // If any permission is selected in this cluster (which represents a module/entity),
            // and there is a "read" or "view" permission in this cluster, ensure it is selected.
            if (newClusterSlugs.length > 0) {
                const readNode = node.children!.find(c => c.id.endsWith('.read') || c.id.endsWith('.view'));
                if (readNode) {
                    if (!newClusterSlugs.includes(readNode.id)) {
                        newClusterSlugs.push(readNode.id);
                        // Optional: Toast "Read permission auto-selected"
                    }
                }
            }
            // -------------------------------------

            const otherSlugs = selectedSlugs.filter(s => !leafSlugs.includes(s))
            onChange([...otherSlugs, ...newClusterSlugs])
        }

        // Log render state specifically for debugging the mismatch
        console.log(`[Render] ${node.label} Full:${isFullAccess} Sel:${clusterSelection.length} HasAll:${clusterSelection.includes("__ALL__")} Input:${isHidden ? "Placehold" : "Badges"}`)

        return (
            <div className={cn(
                "flex flex-row items-center justify-between px-4 h-14 mb-2 rounded-lg transition-all border",
                isFullAccess ? "bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-card border-border dark:bg-muted/5 dark:border-border hover:border-primary/20",
                isHidden && "bg-muted/5 border-dashed border-muted-foreground/30 opacity-95",
                level > 0 && "ml-6"
            )}>
                <div className="flex items-center gap-2 min-w-[200px]">
                    <div className="w-6 h-6 mr-2 shrink-0" aria-hidden="true" />
                    {node.scope === 'SYSTEM' && <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200 shadow-sm">SYS</Badge>}
                    {node.scope === 'TENANT' && <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-orange-50 text-orange-700 border-orange-200 shadow-sm">ORQ</Badge>}

                    <div className="flex flex-col">
                        <span className="font-semibold text-sm leading-none">{node.label}</span>
                    </div>
                    {node.isDangerous && <ShieldAlert className="w-4 h-4 text-amber-500" />}
                </div>

                <div className="flex-1 max-w-xl pl-4">
                    <MultiSelect
                        options={smartOptions}
                        selected={clusterSelection}
                        onChange={handleSmartChange}
                        placeholder={isFullAccess ? "Bütün icazələr seçilib" : isHidden ? "İcazələri seçin..." : `${clusterSelection.length} icazə seçilib`}
                        className="bg-background shadow-sm h-9"
                        maxCount={3}
                    />
                </div>
            </div>
        )
    }

    // --- CASE 2: GROUP (ACCORDION WITH HEADER BUTTONS) ---
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mb-2">
            <div
                className={cn(
                    "flex flex-row items-center justify-between px-4 h-14 mb-2 rounded-lg transition-all border select-none cursor-pointer",
                    isFullAccess ? "bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-card border-border dark:bg-muted/5 dark:border-border hover:border-primary/20",
                    level > 0 && "ml-6"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0 mr-2 shrink-0 text-muted-foreground/60 group-hover:text-foreground transition-colors">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>

                <div className="flex items-center gap-2 flex-1">
                    <span className={cn("text-sm text-foreground/90", level === 0 ? "font-bold text-base uppercase tracking-tight" : "font-medium")}>
                        {node.label}
                    </span>
                    {level === 0 && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 text-muted-foreground font-normal">
                            {leafSlugs.length} Module
                        </Badge>
                    )}
                </div>

                {/* Group Header Actions - ONLY VISIBLE HERE */}
                <div className="flex items-center gap-2 mr-1">
                    <div className="flex gap-1 bg-background/50 rounded-md p-0.5 border border-transparent hover:border-border transition-all" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant={isFullAccess ? "default" : "ghost"}
                            size="sm"
                            className={cn("h-7 text-[10px] px-2.5 transition-all font-medium",
                                isFullAccess ? "bg-green-600 hover:bg-green-700 text-white shadow-sm" : "text-muted-foreground hover:text-green-600 hover:bg-green-50"
                            )}
                            onClick={handleFullAccess}
                            title="Bütün qrupu seç"
                        >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Tam İcazə
                        </Button>
                        <div className="w-[1px] h-4 bg-border my-auto mx-0.5" />
                        <Button
                            variant={isHidden ? "destructive" : "ghost"}
                            size="sm"
                            className={cn("h-7 text-[10px] px-2.5 transition-all font-medium",
                                isHidden ? "bg-red-500 hover:bg-red-600 text-white shadow-sm" : "text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            )}
                            onClick={handleHidden}
                            title="Bütün qrupu sıfırla"
                        >
                            <EyeOff className="w-3.5 h-3.5 mr-1" />
                            Gizlət
                        </Button>
                    </div>
                </div>
            </div>

            <CollapsibleContent>
                <div className={cn(
                    "pl-4 py-3 space-y-3",
                    level === 0 ? "border border-t-0 rounded-b-md p-4 bg-muted/5 shadow-inner" : "border-l-2 ml-7 my-1 border-muted/50"
                )}>
                    {node.children?.map(child => (
                        <PermissionRow
                            key={child.id}
                            node={child}
                            selectedSlugs={selectedSlugs}
                            onChange={onChange}
                            level={level + 1}
                            searchTerm={searchTerm}
                        />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

export function PermissionTreeEditor({ permissions = [], selectedSlugs = [], onChange, className }: PermissionTreeEditorProps) {
    const [searchTerm, setSearchTerm] = useState("")

    return (
        <div className={cn("flex flex-col space-y-4", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="İcazələri axtar (modul adı, kod, açıqlama)..."
                    className="pl-9 bg-card py-5 shadow-sm border-muted-foreground/20 focus-visible:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4 min-h-[400px]">
                {permissions.length > 0 ? (
                    permissions.map(node => (
                        <PermissionRow
                            key={node.id}
                            node={node}
                            selectedSlugs={selectedSlugs}
                            onChange={onChange}
                            searchTerm={searchTerm}
                        />
                    ))
                ) : (

                    <div className="text-center py-16 text-muted-foreground flex flex-col items-center border-2 border-dashed rounded-xl bg-muted/5">
                        <ShieldAlert className="w-12 h-12 text-muted-foreground/20 mb-3" />
                        <p className="font-medium text-lg">Göstəriləcək icazə tapılmadı.</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">Axtarış sözünü dəyişin və ya filtrləri yoxlayın.</p>
                    </div>
                )}
            </div>

            <div className="sticky bottom-0 bg-background/80 backdrop-blur-md p-4 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-xl flex items-center justify-between z-10 transition-all">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-full transition-colors", selectedSlugs.length > 0 ? "bg-primary/10" : "bg-muted")}>
                        <Check className={cn("w-5 h-5", selectedSlugs.length > 0 ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl leading-none tabular-nums tracking-tight">{selectedSlugs.length}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Seçilmiş Səlahiyyət</span>
                    </div>
                </div>
                <Badge variant="outline" className="text-xs font-normal text-muted-foreground/80 bg-background/50 backdrop-blur px-3 py-1">
                    Avtomatik yadda saxlanılır
                </Badge>
            </div>
        </div>
    )
}
