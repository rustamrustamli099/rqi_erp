import { useMemo } from "react"
import { Badge } from "@/shared/components/ui/badge"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { ArrowRight, Plus, Minus, MinusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
// We will simply display slugs if lookup fails, but ideally we use the structure
import { getPermissionLabel } from "@/app/security/permission-structure"

interface PermissionDiffViewerProps {
    original: string[]
    modified: string[]
    className?: string
}

export function PermissionDiffViewer({
    original = [],
    modified = [],
    className
}: PermissionDiffViewerProps) {
    const diff = useMemo(() => {
        const originalSet = new Set(original)
        const modifiedSet = new Set(modified)

        const added = modified.filter(p => !originalSet.has(p))
        const removed = original.filter(p => !modifiedSet.has(p))
        const unchanged = original.filter(p => modifiedSet.has(p))

        // Sort by label for better readability
        const sortByLabel = (a: string, b: string) => {
            return getPermissionLabel(a).localeCompare(getPermissionLabel(b))
        }

        return {
            added: added.sort(sortByLabel),
            removed: removed.sort(sortByLabel),
            unchanged: unchanged.sort(sortByLabel)
        }
    }, [original, modified])

    if (diff.added.length === 0 && diff.removed.length === 0) {
        return (
            <div className={cn("p-8 text-center text-muted-foreground border rounded-md border-dashed", className)}>
                <div className="flex justify-center mb-2">
                    <MinusCircle className="h-8 w-8 opacity-20" />
                </div>
                <p>Heç bir dəyişiklik yoxdur.</p>
            </div>
        )
    }

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
            {/* Added Permissions */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
                    <Plus className="h-4 w-4" />
                    <span className="font-semibold text-sm">Əlavə Edilənlər ({diff.added.length})</span>
                </div>

                {diff.added.length > 0 ? (
                    <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                        <ul className="space-y-1">
                            {diff.added.map(slug => (
                                <li key={slug} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted/50 transition-colors">
                                    <Badge variant="outline" className="border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400 h-5 px-1.5 text-[10px] font-normal">
                                        NEW
                                    </Badge>
                                    <span>{getPermissionLabel(slug)}</span>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                ) : (
                    <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground border rounded-md border-dashed bg-muted/10">
                        Əlavə edilən yoxdur
                    </div>
                )}
            </div>

            {/* Removed Permissions */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                    <Minus className="h-4 w-4" />
                    <span className="font-semibold text-sm">Silinənlər ({diff.removed.length})</span>
                </div>

                {diff.removed.length > 0 ? (
                    <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                        <ul className="space-y-1">
                            {diff.removed.map(slug => (
                                <li key={slug} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted/50 transition-colors text-muted-foreground line-through decoration-red-500/50">
                                    <Badge variant="outline" className="border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400 h-5 px-1.5 text-[10px] font-normal no-underline">
                                        DEL
                                    </Badge>
                                    <span className="flex-1 text-foreground/70">{getPermissionLabel(slug)}</span>
                                    <ArrowRight className="h-3 w-3 opacity-30" />
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                ) : (
                    <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground border rounded-md border-dashed bg-muted/10">
                        Silinən yoxdur
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t flex justify-between text-sm text-muted-foreground">
                <div>
                    Ümumi İcazə Sayı: <span className="font-medium text-foreground">{modified.length}</span>
                </div>
                <div>
                    Dəyişilməyən: <span className="font-medium text-foreground">{diff.unchanged.length}</span>
                </div>
            </div>
        </div>
    )
}
