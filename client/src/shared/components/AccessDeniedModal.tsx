import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ShieldAlert } from "lucide-react"
import { useEffect, useState } from "react"

export function AccessDeniedModal() {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("You do not have permission to perform this action.")

    useEffect(() => {
        // Listen for 403 errors dispatched via custom event or similar mechanism.
        // For simplicity, we'll hook into window events, or ideally this would be connected to the RTK Query middleware.

        const handleAccessDenied = (event: CustomEvent) => {
            setMessage(event.detail?.message || "Operation restricted by security policy.")
            setOpen(true)
        }

        window.addEventListener('access-denied', handleAccessDenied as EventListener)

        return () => {
            window.removeEventListener('access-denied', handleAccessDenied as EventListener)
        }
    }, [])

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="border-destructive/50 bg-destructive/5">
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <ShieldAlert className="h-6 w-6" />
                        <AlertDialogTitle>Access Denied</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-foreground">
                        {message}
                        <br /><br />
                        <span className="text-xs text-muted-foreground">If you believe this is an error, please contact your administrator.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setOpen(false)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Acknowledge
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
