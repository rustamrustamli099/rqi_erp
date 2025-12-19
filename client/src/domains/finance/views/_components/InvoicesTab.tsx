import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import type { Invoice } from "./invoices-columns"
import { columns } from "./invoices-columns"
import { financeApi } from "../../api/finance.contract"
import { toast } from "sonner"

export function InvoicesTab() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        financeApi.getInvoices()
            .then((data: any[]) => setInvoices(data as unknown as Invoice[]))
            .catch(() => toast.error("Fakturalar yüklənə bilmədi"))
            .finally(() => setIsLoading(false))
    }, [])

    if (isLoading) {
        return <div>Yüklənir...</div>; // Simple loader to use the variable
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ödəniş Tarixçəsi</CardTitle>
                <CardDescription>Son fakturalarınız</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={invoices}
                    searchKey="number"
                />
            </CardContent>
        </Card>
    )
}
