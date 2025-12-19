import * as React from "react"
import type { Table } from "@tanstack/react-table"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Settings2, GripVertical } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip"

interface DataTableColumnReorderProps<TData> {
    table: Table<TData>
}

// Sortable Item Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableColumnItem({ column, id }: { column: any; id: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center space-x-2 rounded-md border p-2 bg-background mb-2"
        >
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
            </div>
            <Checkbox
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                id={`col-${id}`}
            />
            <label
                htmlFor={`col-${id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
            >
                {id}
            </label>
        </div>
    )
}

export function DataTableColumnReorder<TData>({
    table,
}: DataTableColumnReorderProps<TData>) {
    const [open, setOpen] = React.useState(false)

    // Memoize columns to prevent re-renders
    const columns = React.useMemo(() =>
        table.getAllColumns().filter(
            (column) => typeof column.accessorFn !== "undefined" && column.getCanHide()
        ),
        [table]) // Table instance usually stable, but if it changes, we re-calc.

    const [columnOrder, setColumnOrder] = React.useState<string[]>(
        () => columns.map((c) => c.id)
    )

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            setColumnOrder((items) => {
                const oldIndex = items.indexOf(active.id as string)
                const newIndex = items.indexOf(over?.id as string)
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Update table column order
                table.setColumnOrder(newOrder);
                return newOrder;
            })
        }
    }

    // Effect to sync with table's actual columns on mount/update
    // FIXED: Infinite loop caused by unstable 'columns' dependency and state updates
    React.useEffect(() => {
        const tableOrder = table.getState().columnOrder

        if (tableOrder && tableOrder.length > 0) {
            setColumnOrder(prev => {
                // Only update if actually different
                if (JSON.stringify(prev) !== JSON.stringify(tableOrder)) {
                    return tableOrder
                }
                return prev
            })
        }
        // We do NOT add 'columns' to dependency here to avoid loop if columns are unstable
    }, [table.getState().columnOrder]) // Only re-run if Table STATE changes


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Sütunları İdarə Et</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sütunları İdarə Et</DialogTitle>
                    <DialogDescription>
                        Sütunları gizlətmək üçün işarələyin, yerini dəyişmək üçün sürüşdürün.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={columnOrder}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {columnOrder.map((colId) => {
                                    const column = table.getColumn(colId);
                                    if (!column || !column.getCanHide()) return null;

                                    return (
                                        <SortableColumnItem key={colId} id={colId} column={column} />
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                </ScrollArea>
                <div className="flex justify-end">
                    <Button onClick={() => setOpen(false)}>Bağla</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
