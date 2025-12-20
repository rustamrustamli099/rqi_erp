
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RequirePermission } from '@/shared/components/auth/RequirePermission';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';

// Mock Data (In production, fetch from /api/v1/finance/dashboard)
const REVENUE_DATA = [
    { name: 'Jan', revenue: 12400 },
    { name: 'Feb', revenue: 18300 },
    { name: 'Mar', revenue: 25000 },
    { name: 'Apr', revenue: 21000 },
    { name: 'May', revenue: 32000 },
    { name: 'Jun', revenue: 45000 },
];

const MODULE_REVENUE = [
    { name: 'Core Billing', amount: 35000 },
    { name: 'Storage', amount: 8000 },
    { name: 'Users', amount: 15000 },
    { name: 'API Usage', amount: 4500 },
];

const RECENT_TRANSACTIONS = [
    { id: 'TX-1001', tenant: 'Acme Corp', amount: 1200.00, status: 'PAID', date: '2024-06-21' },
    { id: 'TX-1002', tenant: 'Globex Inc', amount: 850.50, status: 'PAID', date: '2024-06-20' },
    { id: 'TX-1003', tenant: 'Soylent Corp', amount: 2500.00, status: 'PENDING', date: '2024-06-20' },
    { id: 'TX-1004', tenant: 'Umbrella Corp', amount: 5000.00, status: 'FAILED', date: '2024-06-19' },
    { id: 'TX-1005', tenant: 'Cyberdyne', amount: 10000.00, status: 'PAID', date: '2024-06-18' },
];

export const ProviderFinanceDashboard = () => {
    // In real app: const { data, isLoading } = useProviderFinance();
    const isLoading = false;

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8" /></div>;

    return (
        <RequirePermission permission="system.finance.view" fallback={<div className="p-8 text-center text-muted-foreground">Access Restricted</div>}>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Provider Finance</h1>
                        <p className="text-muted-foreground">System-wide revenue and tenant billing overview.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$153,700</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$45,000</div>
                            <p className="text-xs text-muted-foreground">+180 new subscriptions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,203</div>
                            <p className="text-xs text-muted-foreground">+43 since last week</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Revenue Per Tenant</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$127.50</div>
                            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                            <CardDescription>Monthly revenue across all modules.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={REVENUE_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                            itemStyle={{ color: 'var(--foreground)' }}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Revenue by Category</CardTitle>
                            <CardDescription>Breakdown by billing source</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={MODULE_REVENUE} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Area */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Billing Transactions</CardTitle>
                        <CardDescription>Real-time feed of system-wide transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Tenant</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {RECENT_TRANSACTIONS.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-medium">{tx.id}</TableCell>
                                        <TableCell>{tx.tenant}</TableCell>
                                        <TableCell>{tx.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={tx.status === 'PAID' ? 'default' : tx.status === 'PENDING' ? 'secondary' : 'destructive'}>
                                                {tx.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">${tx.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </RequirePermission>
    );
};
