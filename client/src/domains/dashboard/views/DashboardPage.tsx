import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from "recharts"
import {
    Calendar as CalendarIcon, MoreHorizontal, Filter, Download, DollarSign,
    ArrowUpRight, ShoppingCart, ArrowDownRight, Package, Users
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { DataTable } from "@/shared/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// --- Inlined Components ---
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
// PHASE 100% PFCG: Backend Decision Center
import { usePageState } from "@/app/security/usePageState"

export function CalendarDateRangePicker({
    className,
    date,
    setDate,
}: {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}



export type Order = {
    id: string
    customer: string
    amount: number
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    date: string
    region: string
}

// Converted to factory to accept permissions
export const createColumns = (permissions: { canExport: boolean }): ColumnDef<Order>[] => [
    {
        accessorKey: "id",
        header: "Sifariş ID",
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.getValue("id")}</span>,
    },
    {
        accessorKey: "customer",
        header: "Müştəri",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-sm">{row.getValue("customer")}</span>
                <span className="text-[10px] text-muted-foreground">{row.original.region}</span>
            </div>
        ),
    },
    {
        accessorKey: "amount",
        header: "Məbləğ",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={
                    status === 'completed' ? 'default' :
                        status === 'processing' ? 'secondary' :
                            status === 'pending' ? 'outline' : 'destructive'
                } className="uppercase text-[10px]">
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "date",
        header: "Tarix",
        cell: ({ row }) => <div className="text-xs text-muted-foreground">{new Date(row.getValue("date")).toLocaleDateString()}</div>,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                            ID Kopyala
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Sifarişə Bax</DropdownMenuItem>
                        {permissions.canExport && <DropdownMenuItem>Faktura Yüklə</DropdownMenuItem>}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]


// Static Data for "Functional" State
const MOCK_ORDERS: Order[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `ORD-${1000 + i}`,
    customer: ['Acme Corp', 'Globex Inc', 'Soylent Corp', 'Umbrella Corp', 'Stark Ind'][Math.floor(Math.random() * 5)],
    amount: Math.floor(Math.random() * 5000) + 100,
    status: ['completed', 'processing', 'pending', 'cancelled'][Math.floor(Math.random() * 4)] as any,
    date: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
    region: ['NA', 'EU', 'AS', 'SA'][Math.floor(Math.random() * 4)]
}))

const GRAPH_DATA = Array.from({ length: 12 }).map((_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: Math.floor(Math.random() * 50000) + 20000,
    orders: Math.floor(Math.random() * 200) + 50
}))

import { useHelp } from "@/app/context/HelpContext";
import { useEffect } from "react";

export default function DashboardPage() {
    const { setPageKey } = useHelp();
    // PHASE 100% PFCG: Backend-driven action visibility
    const { actions } = usePageState('Z_DASHBOARD');
    const canExport = actions?.GS_DASHBOARD_EXPORT ?? false;
    const canFilter = actions?.GS_DASHBOARD_FILTER ?? false;

    useEffect(() => {
        setPageKey("dashboard");
    }, [setPageKey]);

    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(2023, 0, 20),
        to: addDays(new Date(2023, 0, 20), 20),
    })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Filter Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 p-4 rounded-lg border shadow-sm backdrop-blur">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
                    <p className="text-sm text-muted-foreground">Biznes performans göstəriciləri və analitika.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Tenant Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Bütün Tenantlar</SelectItem>
                            <SelectItem value="t1">Acme Corp</SelectItem>
                            <SelectItem value="t2">Globex Inc</SelectItem>
                        </SelectContent>
                    </Select>

                    <CalendarDateRangePicker date={date} setDate={setDate} />

                    {canFilter && <Button variant="outline" size="icon" className="bg-background"><Filter className="w-4 h-4" /></Button>}
                    {canExport && <Button variant="outline" size="icon" className="bg-background"><Download className="w-4 h-4" /></Button>}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gəlir</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1"><ArrowUpRight className="w-3 h-3" /> +20.1%</span> keçən aydan
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sifarişlər</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+2350</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1"><ArrowUpRight className="w-3 h-3" /> +180.1%</span> keçən aydan
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hazırkı Abunəliklər</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12,234</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-red-500 flex items-center mr-1"><ArrowDownRight className="w-3 h-3" /> -4%</span> keçən aydan
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktiv İcazələr</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1"><ArrowUpRight className="w-3 h-3" /> +201</span> son saatda
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Gəlir Analitikası</CardTitle>
                        <CardDescription>Aylıq gəlir və sifariş sayı müqayisəsi.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={GRAPH_DATA}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Bölgələr Üzrə Satış</CardTitle>
                        <CardDescription>Regional performans bölgüsü.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={[
                                    { name: 'NA', val: 4000 },
                                    { name: 'EU', val: 3000 },
                                    { name: 'AS', val: 2000 },
                                    { name: 'SA', val: 2780 },
                                ]} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" fontSize={12} />
                                    <YAxis dataKey="name" type="category" fontSize={12} width={30} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                    <Bar dataKey="val" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                                        {
                                            [0, 1, 2, 3].map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'][index % 4]} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Son Sifarişlər</CardTitle>
                    <CardDescription>Sistemə daxil olan ən son sifarişlərin siyahısı.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={createColumns({ canExport })} data={MOCK_ORDERS} searchKey="customer" filterPlaceholder="Müştəri axtar..." />
                </CardContent>
            </Card>
        </div>
    )
}
