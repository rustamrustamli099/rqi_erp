
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/domains/auth/context/AuthContext';
// import { api } from '@/shared/api'; // Assuming you have an api wrapper

export const ProviderFinanceDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        accountsReceivable: 0,
    });
    const [recentEntries, setRecentEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch for now, replace with actual API call
        // api.get('/finance/dashboard').then(...)

        // Simulating API loading
        setTimeout(() => {
            setStats({
                totalRevenue: 12500.00,
                accountsReceivable: 450.00
            });
            setRecentEntries([
                { id: '1', description: 'Subscription Revenue: INV-170312 (Acme Corp)', amount: 120.00, type: 'REVENUE', date: '2025-12-20T14:30:00' },
                { id: '2', description: 'Subscription Revenue: INV-170311 (Beta Ltd)', amount: 250.00, type: 'REVENUE', date: '2025-12-20T12:15:00' },
                { id: '3', description: 'Subscription Revenue: INV-170310 (Gamma Inc)', amount: 99.00, type: 'REVENUE', date: '2025-12-19T09:45:00' },
            ]);
            setLoading(false);
        }, 1000);

    }, []);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Məlumatlar yüklənir...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Provider Finance</h1>
                <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                    <AlertCircle className="w-3 h-3 mr-1" /> Read-Only Ledger View
                </Badge>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} ₼</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accounts Receivable</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.accountsReceivable.toFixed(2)} ₼</div>
                        <p className="text-xs text-muted-foreground">Pending invoices</p>
                    </CardContent>
                </Card>
                {/* Placeholders for Churn / Active Tenants */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142</div>
                        <p className="text-xs text-muted-foreground">+12 new this month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger Entries Table */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Ledger Entries (System)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                            {recentEntries.map(entry => (
                                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{entry.description}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center font-bold text-emerald-600">
                                        +{entry.amount.toFixed(2)} ₼
                                    </div>
                                </div>
                            ))}
                            {recentEntries.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">No entries found.</div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};
