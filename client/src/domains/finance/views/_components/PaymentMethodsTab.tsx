import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard } from "lucide-react"

export function PaymentMethodsTab() {
    // Placeholder for Payment Methods (Saved Cards)
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ödəniş Üsulları</CardTitle>
                <CardDescription>Yadda saxlanılan kartlar və ödəniş vasitələri.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-md bg-background mb-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium">Visa •••• 4242</p>
                            <p className="text-xs text-muted-foreground">Exp: 12/28</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Default</Badge>
                </div>
                <Button>Yeni Kart Əlavə Et</Button>
            </CardContent>
        </Card>
    )
}
