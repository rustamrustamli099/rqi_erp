
import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from "@tanstack/react-table"
import type {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState
} from "@tanstack/react-table"
import {
    Trash2,
    Edit,
    MoreHorizontal,
    ArrowUpDown,
    Archive,
    Scale,
    Coins
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { toast } from "sonner"
import {
    MOCK_SECTORS,
    MOCK_UNITS,
    MOCK_CURRENCIES,
} from "@/shared/constants/reference-data"
import type {
    Sector,
    Unit,
    Currency
} from "@/shared/constants/reference-data"
import AddressSettingsTab from "./AddressSettingsTab"
import TimezoneSettingsTab from "./TimezoneSettingsTab"

export function DictionariesTab() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentSubTab = searchParams.get('subTab') || 'sectors';

    const handleTabChange = (value: string) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('subTab', value);
            return newParams;
        }, { replace: true });
    };

    return (
        <div className="space-y-4">
            <Tabs value={currentSubTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full h-auto flex-wrap grid-cols-2 md:grid-cols-5 gap-1">
                    <TabsTrigger value="currency">Valyutalar</TabsTrigger>
                    <TabsTrigger value="country">Ölkələr</TabsTrigger>
                    <TabsTrigger value="city">Şəhərlər</TabsTrigger>
                    <TabsTrigger value="sectors">Sektorlar</TabsTrigger>
                    <TabsTrigger value="units">Ölçü Vahidləri</TabsTrigger>
                    <TabsTrigger value="timezones">Zaman Zonaları</TabsTrigger>
                    <TabsTrigger value="address">Ünvanlar</TabsTrigger>
                </TabsList>

                <TabsContent value="currency" className="space-y-4 mt-4">
                    <CurrenciesManager />
                </TabsContent>

                <TabsContent value="country" className="space-y-4 mt-4">
                    <AddressSettingsTab />
                </TabsContent>

                <TabsContent value="city" className="space-y-4 mt-4">
                    <AddressSettingsTab />
                </TabsContent>

                <TabsContent value="sectors" className="space-y-4 mt-4">
                    <SectorsManager />
                </TabsContent>

                <TabsContent value="units" className="space-y-4 mt-4">
                    <UnitsManager />
                </TabsContent>

                <TabsContent value="timezones" className="space-y-4 mt-4">
                    <TimezoneSettingsTab />
                </TabsContent>
            </Tabs>
        </div >
    )
}

function SectorsManager() {
    const [data, setData] = useState<Sector[]>(MOCK_SECTORS)
    const [newItemName, setNewItemName] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)

    // Table State
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        const newItem: Sector = { id: Math.random().toString(), name: newItemName }
        setData([...data, newItem])
        setNewItemName("")
        setIsAddOpen(false)
        toast.success("Sektor əlavə edildi")
    }

    const handleDelete = (id: string) => {
        if (confirm("Silmək istədiyinizə əminsiniz?")) {
            setData(data.filter(s => s.id !== id))
            toast.success("Sektor silindi")
        }
    }

    const columns: ColumnDef<Sector>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Sektor Adı
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Archive className="h-4 w-4 opacity-50" />
                    </div>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => {
                const sector = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { }}>
                                <Edit className="mr-2 h-4 w-4" /> Düzəliş Et
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(sector.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Sil
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <h3 className="text-lg font-medium">Fəaliyyət Sektorları</h3>
                <p className="text-sm text-muted-foreground">Şirkətlərin fəaliyyət sahələrinin siyahısı.</p>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yeni Sektor Əlavə Et</DialogTitle>
                        <DialogDescription>Sektorun adını daxil edin.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sector-name">Sektor Adı</Label>
                            <Input
                                id="sector-name"
                                value={newItemName}
                                onChange={e => setNewItemName(e.target.value)}
                                placeholder="Tikinti, Təhsil və s."
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Əlavə Et</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="rounded-md border bg-card p-4">
                <DataTableToolbar
                    table={table}
                    onAddClick={() => setIsAddOpen(true)}
                    addLabel="Yeni Sektor"
                    filterPlaceholder="Sektor adı..."
                    hideViewOptions={true}
                />
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Nəticə tapılmadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination table={table} />
            </div>
        </div>
    )
}

function UnitsManager() {
    const [data, setData] = useState<Unit[]>(MOCK_UNITS)
    const [itemName, setItemName] = useState("")
    const [itemCode, setItemCode] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)

    // Table State
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        const newItem: Unit = { id: Math.random().toString(), name: itemName, code: itemCode }
        setData([...data, newItem])
        setItemName("")
        setItemCode("")
        setIsAddOpen(false)
        toast.success("Ölçü vahidi əlavə edildi")
    }

    const handleDelete = (id: string) => {
        if (confirm("Silmək istədiyinizə əminsiniz?")) {
            setData(data.filter(s => s.id !== id))
            toast.success("Ölçü vahidi silindi")
        }
    }

    const columns: ColumnDef<Unit>[] = [
        {
            accessorKey: "code",
            header: "Kod",
            cell: ({ row }) => <span className="font-mono">{row.getValue("code")}</span>
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Ad
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Scale className="h-4 w-4 opacity-50" />
                    </div>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => {
                const unit = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { }}>
                                <Edit className="mr-2 h-4 w-4" /> Düzəliş Et
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(unit.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Sil
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <h3 className="text-lg font-medium">Ölçü Vahidləri</h3>
                <p className="text-sm text-muted-foreground">Məhsul və xidmətlər üçün ölçü vahidləri.</p>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yeni Ölçü Vahidi</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unit-name">Vahid Adı</Label>
                                <Input
                                    id="unit-name"
                                    value={itemName}
                                    onChange={e => setItemName(e.target.value)}
                                    placeholder="Kilogram"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit-code">Kod (Qısa)</Label>
                                <Input
                                    id="unit-code"
                                    value={itemCode}
                                    onChange={e => setItemCode(e.target.value)}
                                    placeholder="kg"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Əlavə Et</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="rounded-md border bg-card p-4">
                <DataTableToolbar
                    table={table}
                    onAddClick={() => setIsAddOpen(true)}
                    addLabel="Yeni Ölçü Vahidi"
                    filterPlaceholder="Vahid adı..."
                    hideViewOptions={true}
                />
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Nəticə tapılmadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination table={table} />
            </div>
        </div>
    )
}

function CurrenciesManager() {
    const [data, setData] = useState<Currency[]>(MOCK_CURRENCIES)
    const [formData, setFormData] = useState({ name: "", code: "", symbol: "" })
    const [isAddOpen, setIsAddOpen] = useState(false)

    // Table State
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        const newItem: Currency = { id: Math.random().toString(), ...formData }
        setData([...data, newItem])
        setFormData({ name: "", code: "", symbol: "" })
        setIsAddOpen(false)
        toast.success("Valyuta əlavə edildi")
    }

    const handleDelete = (id: string) => {
        if (confirm("Silmək istədiyinizə əminsiniz?")) {
            setData(data.filter(s => s.id !== id))
            toast.success("Valyuta silindi")
        }
    }

    const columns: ColumnDef<Currency>[] = [
        {
            accessorKey: "code",
            header: "Kod",
            cell: ({ row }) => <span className="font-mono font-bold">{row.getValue("code")}</span>
        },
        {
            accessorKey: "symbol",
            header: "Simvol",
            cell: ({ row }) => <span className="font-mono text-lg">{row.getValue("symbol")}</span>
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Valyuta Adı
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Coins className="h-4 w-4 opacity-50" />
                    </div>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Əməliyyatlar",
            cell: ({ row }) => {
                const currency = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { }}>
                                <Edit className="mr-2 h-4 w-4" /> Düzəliş Et
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(currency.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Sil
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <h3 className="text-lg font-medium">Valyutalar</h3>
                <p className="text-sm text-muted-foreground">Maliyyə əməliyyatları üçün valyutalar.</p>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yeni Valyuta</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 space-y-2">
                                <Label htmlFor="curr-code">Kod (ISO)</Label>
                                <Input
                                    id="curr-code"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="USD"
                                    maxLength={3}
                                    required
                                />
                            </div>
                            <div className="col-span-1 space-y-2">
                                <Label htmlFor="curr-symbol">Simvol</Label>
                                <Input
                                    id="curr-symbol"
                                    value={formData.symbol}
                                    onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                                    placeholder="$"
                                    required
                                />
                            </div>
                            <div className="col-span-3 space-y-2">
                                <Label htmlFor="curr-name">Ad</Label>
                                <Input
                                    id="curr-name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ABŞ Dolları"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Əlavə Et</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="rounded-md border bg-card p-4">
                <DataTableToolbar
                    table={table}
                    onAddClick={() => setIsAddOpen(true)}
                    addLabel="Yeni Valyuta"
                    filterPlaceholder="Valyuta..."
                    hideViewOptions={true}
                />
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Nəticə tapılmadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div >
                <DataTablePagination table={table} />
            </div >
        </div >
    )
}
