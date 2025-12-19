import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import type { Subscription } from "./subscriptions-columns" // Type-only import
import { columns } from "./subscriptions-columns"
import { financeApi } from "../../api/finance.contract"
import { toast } from "sonner"

export function SubscriptionsTab() {
    const [subs, setSubs] = useState<Subscription[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        financeApi.getSubscriptions()
            .then((data: any[]) => { // data from API might not strictly match UI type
                const typedData = data as unknown as Subscription[]
                if (Array.isArray(typedData)) {
                    setSubs(typedData)
                } else {
                    console.warn("Invalid subscriptions data:", data)
                    setSubs([])
                }
            })
            .catch((err) => {
                console.error("Failed to load subscriptions:", err)
                toast.error("Abunəliklər yüklənə bilmədi")
                setSubs([])
            })
            .finally(() => setIsLoading(false))
    }, [])

    if (isLoading) {
        return <div>Yüklənir...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aktiv Abunəliklər</CardTitle>
                <CardDescription>Bütün tenantların aktiv abunəlik statusu.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={subs}
                    searchKey="tenant.name"
                />
            </CardContent>
        </Card>
    )
}
