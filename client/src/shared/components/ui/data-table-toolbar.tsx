import type { Table } from "@tanstack/react-table"
import { X, Search, RefreshCcw, Plus, SlidersHorizontal, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableColumnReorder } from "@/components/ui/data-table-column-reorder"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    filterColumn?: string
    filterPlaceholder?: string
    searchPlaceholder?: string // Added alias
    children?: React.ReactNode // For facet filters
    onRefresh?: () => void
    onAddClick?: () => void // Added
    addLabel?: string // Added
    hideViewOptions?: boolean // Added to fix type error
    onFilterClick?: () => void // Added
    // Controlled Mode
    searchValue?: string
    onSearchChange?: (value: string) => void
    // Export Support
    onExportClick?: () => void
}

export function DataTableToolbar<TData>({
    table,
    filterColumn,
    filterPlaceholder,
    searchPlaceholder,
    children,
    onRefresh,
    onAddClick,
    addLabel,
    hideViewOptions,
    onFilterClick,
    searchValue,
    onSearchChange,
    onExportClick,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    const placeholder = searchPlaceholder || filterPlaceholder || "Axtar...";

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (onSearchChange) {
            onSearchChange(value);
        } else if (filterColumn) {
            table.getColumn(filterColumn)?.setFilterValue(value);
        } else {
            table.setGlobalFilter(value);
        }
    };

    const getSearchValue = () => {
        if (searchValue !== undefined) return searchValue;
        if (filterColumn) return (table.getColumn(filterColumn)?.getFilterValue() as string) ?? "";
        return (table.getState().globalFilter as string) ?? "";
    }

    return (
        <div className="flex items-center justify-between p-1 gap-2">
            <div className="flex flex-1 items-center space-x-2">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={placeholder}
                        value={getSearchValue()}
                        onChange={handleSearchChange}
                        className="h-9 w-[150px] lg:w-[250px] pl-8"
                    />
                </div>

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Sıfırla
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-1">
                {/* Refresh Button */}
                {onRefresh && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
                                    <RefreshCcw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Yenilə</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {/* Filter Button */}
                {onFilterClick && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFilterClick}>
                                    <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Filterləmə</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {/* Filter Drawer Trigger (Passed as Children) */}
                {children}

                {/* Export Button */}
                {onExportClick && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={onExportClick}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excel-ə İxrac Et</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {/* Column Visibility & Reorder Modal */}
                {!hideViewOptions && <DataTableColumnReorder table={table} />}

                {/* Primary Add Action (Icon) */}
                {onAddClick && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" onClick={onAddClick} className="ml-1 h-8 w-8">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{addLabel || "Əlavə et"}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
    )
}
