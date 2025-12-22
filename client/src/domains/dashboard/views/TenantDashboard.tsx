import { useState, useEffect } from "react"
import { useHelp } from "@/app/context/HelpContext"
import { type DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, Filter, Download, ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/shared/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts"

// --- Reused Components ---
// Ideally these should be in a shared file, but expanding here for speed & isolation
function CalendarDateRangePicker({
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

const GRAPH_DATA = Array.from({ length: 12 }).map((_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: Math.floor(Math.random() * 20000) + 10000, // Lower revenue for single tenant
    orders: Math.floor(Math.random() * 50) + 10
}))

export default function TenantDashboard() {
    const { setPageKey } = useHelp();

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
                    <h2 className="text-2xl font-bold tracking-tight">Organization Overview</h2>
                    <p className="text-sm text-muted-foreground">My Organization Performance Analytics</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    {/* TENANT: No Tenant Selector */}

                    <CalendarDateRangePicker date={date} setDate={setDate} />

                    <Button variant="outline" size="icon" className="bg-background"><Filter className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="bg-background"><Download className="w-4 h-4" /></Button>
                </div>
            </div>

            {/* KPI Cards (Tenant Context) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,450.00</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1"><ArrowUpRight className="w-3 h-3" /> +5.4%</span> vs last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">48</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-muted-foreground flex items-center mr-1"> 0</span> changes
                        </p>
                    </CardContent>
                </Card>
                {/* ... slightly different cards ... */}
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-1">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Sales Performance</CardTitle>
                        <CardDescription>My organization sales figures.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                                <AreaChart data={GRAPH_DATA}>
                                    <defs>
                                        <linearGradient id="colorRevTarget" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevTarget)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
