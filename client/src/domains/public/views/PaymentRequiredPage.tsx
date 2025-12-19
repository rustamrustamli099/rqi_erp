
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CreditCard, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function PaymentRequiredPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full border-red-200 shadow-lg">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-red-100 p-3 rounded-full w-fit">
                        <Lock className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-red-700">Abunəlik Dayandırılıb</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Sizin abunəliyiniz ödəniş borcuna görə müvəqqəti olaraq dayandırılıb.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3 text-sm text-amber-800">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>
                            Sistemə giriş bərpa edilməsi üçün cari borcunuzu ödəməlisiniz. Bütün məlumatlarınız təhlükəsiz şəkildə saxlanılır.
                        </p>
                    </div>

                    <div className="rounded-lg border p-4 bg-white flex justify-between items-center">
                        <span className="text-gray-600">Ödəniləcək Məbləğ:</span>
                        <span className="text-xl font-bold font-mono">29.00 AZN</span>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
                        <CreditCard className="mr-2 h-4 w-4" /> Ödəniş Et
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/login')}>
                        Digər hesabla giriş
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
