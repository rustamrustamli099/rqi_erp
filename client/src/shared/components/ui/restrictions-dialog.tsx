import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { RestrictionsForm, type RestrictionData, DEFAULT_RESTRICTIONS } from "@/components/ui/restrictions-form"


interface RestrictionsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    initialData?: RestrictionData
    onSave: (data: RestrictionData) => void
}

export function RestrictionsDialog({
    open,
    onOpenChange,
    title,
    initialData,
    onSave
}: RestrictionsDialogProps) {
    const [formData, setFormData] = useState<RestrictionData>(initialData || DEFAULT_RESTRICTIONS)

    useEffect(() => {
        if (open) {
            setFormData(initialData || DEFAULT_RESTRICTIONS)
        }
    }, [open, initialData])

    const handleSubmit = () => {
        onSave(formData)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        İstifadəçi üçün fərdi giriş məhdudiyyətlərini tənzimləyin.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <RestrictionsForm
                        value={formData}
                        onChange={setFormData}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Ləğv et</Button>
                    <Button onClick={handleSubmit}>
                        <Check className="mr-2 h-4 w-4" /> Yadda Saxla
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
