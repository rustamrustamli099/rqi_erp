import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Sheet,
    SheetContent,
    SheetDescription, // Added
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter, // Added
} from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"

// Create a simple sheet since we don't have it yet
// Actually, I should probably CREATE the Sheet component first.
// But I'll put it here for now if Sheet is missing.

interface FilterDrawerProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onApply?: () => void;
}

export function FilterDrawer({ children, open, onOpenChange, resetFilters, onApply }: FilterDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Filter</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Filtrlər</SheetTitle>
                    <SheetDescription>
                        Nəticələri daraltmaq üçün aşağıdakı filtrlərdən istifadə edin.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    {children}
                </div>
                <SheetFooter className="flex-row justify-end gap-2">
                    {resetFilters && (
                        <Button variant="outline" onClick={() => {
                            resetFilters();
                            if (onOpenChange) onOpenChange(false);
                        }}>Təmizlə</Button>
                    )}
                    {onApply && (
                        <Button onClick={() => {
                            onApply();
                            if (onOpenChange) onOpenChange(false);
                        }}>Axtar</Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
