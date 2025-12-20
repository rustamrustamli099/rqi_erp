
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/utils";
import { LucideIcons } from "@/shared/lib/icons";
import { useAuth } from "@/domains/auth/context/AuthContext";

// Mock API Call (Replace with Real Reseller API)
// const fetchResellerStats = async () => API.get('/reseller/stats');

export function ResellerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalCommission: 0,
        activeTenants: 0,
        referralCode: "LOADING..."
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setStats({
                totalRevenue: 15000,
                totalCommission: 3000,
                activeTenants: 12,
                referralCode: "RSL-2024-X99"
            });
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) return <div className="p-8">Loading Reseller Dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Reseller Portal</h1>
                <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                    <span className="text-sm font-medium text-muted-foreground">Referral Code:</span>
                    <code className="text-sm font-bold bg-background px-2 py-0.5 rounded border">
                        {stats.referralCode}
                    </code>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue Generated</CardTitle>
                        <LucideIcons.DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all managed tenants
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
                        <LucideIcons.Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCommission)}</div>
                        <p className="text-xs text-muted-foreground">
                            +20% of Tenant Revenue
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                        <LucideIcons.Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeTenants}</div>
                        <p className="text-xs text-muted-foreground">
                            Active subscriptions
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Commission History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No recent transactions.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
