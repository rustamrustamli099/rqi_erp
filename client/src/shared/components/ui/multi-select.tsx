import * as React from "react"
import { Check, ChevronsUpDown, X, Search } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover"

export interface Option {
    label: string
    value: string
}

interface MultiSelectProps {
    options: Option[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    className?: string
    maxCount?: number
    disabled?: boolean
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    className,
    maxCount = 3,
    disabled = false,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")

    const handleUnselect = (value: string) => {
        if (disabled) return
        onChange(selected.filter((s) => s !== value))
    }

    // Filter options
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const toggleSelection = (value: string) => {
        if (disabled) return
        console.log("[MultiSelect] Toggle:", value, "Current Selection:", selected)
        if (selected.includes(value)) {
            handleUnselect(value)
        } else {
            onChange([...selected, value])
        }
        // Keep open for multiple selection
    }

    return (
        <Popover open={open && !disabled} onOpenChange={(val) => {
            if (disabled) return
            setOpen(val)
            if (!val) setSearchTerm("")
        }}>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "flex min-h-[36px] w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        disabled ? "cursor-not-allowed opacity-50 bg-muted" : "cursor-pointer",
                        className
                    )}
                    aria-disabled={disabled}
                >
                    <div className="flex gap-1 flex-wrap items-center">
                        {selected.length > 0 ? (
                            <>
                                {selected.slice(0, maxCount).map((val) => {
                                    // Handle special pseudo-values like __ALL__ for display
                                    const option = options.find((o) => o.value === val)
                                    const label = option?.label || val

                                    return (
                                        <Badge key={val} variant="secondary" className="mr-1 mb-0.5 max-w-[150px] truncate">
                                            {label}
                                            <div
                                                className={cn("ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 inline-flex", disabled ? "cursor-not-allowed hidden" : "cursor-pointer")}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleUnselect(val)
                                                    }
                                                }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleUnselect(val)
                                                }}
                                            >
                                                {!disabled && <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />}
                                            </div>
                                        </Badge>
                                    )
                                })}
                                {selected.length > maxCount && (
                                    <Badge variant="secondary" className="rounded-sm px-1 font-normal bg-muted text-muted-foreground hover:bg-muted mb-0.5">
                                        +{selected.length - maxCount} ...
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="flex flex-col">
                    <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            className="flex h-6 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Axtar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto overflow-x-hidden p-1">
                        {filteredOptions.length === 0 && (
                            <div className="py-6 text-center text-sm text-muted-foreground">Nəticə tapılmadı.</div>
                        )}
                        {filteredOptions.map((option) => {
                            const isSelected = selected.includes(option.value)
                            return (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
                                        isSelected && "bg-accent/50"
                                    )}
                                    onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        toggleSelection(option.value)
                                    }}
                                >
                                    <div className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                    )}>
                                        <Check className={cn("h-4 w-4")} />
                                    </div>
                                    <span className="truncate">{option.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
