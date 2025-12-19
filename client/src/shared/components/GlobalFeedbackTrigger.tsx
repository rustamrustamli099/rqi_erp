
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, ImagePlus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

export function GlobalFeedbackTrigger() {
    const [open, setOpen] = React.useState(false);
    const location = useLocation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock submission
        toast.success("Rəyiniz göndərildi", {
            description: "Fikirləriniz bizim üçün önəmlidir. Təşəkkür edirik!"
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 w-12 h-12 p-0 animate-in zoom-in duration-300 hover:scale-105 transition-transform"
                    size="icon"
                >
                    <MessageSquarePlus className="w-6 h-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rəy və Təklif</DialogTitle>
                    <DialogDescription>
                        Sistemlə bağlı qarşılaşdığınız xətanı və ya təklifinizi bizimlə bölüşün.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Növ
                        </Label>
                        <Select defaultValue="bug">
                            <SelectTrigger className="col-span-3" id="type">
                                <SelectValue placeholder="Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">Xəta (Bug)</SelectItem>
                                <SelectItem value="suggestion">Təklif</SelectItem>
                                <SelectItem value="ux">Dizayn / UX</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                            Vaciblik
                        </Label>
                        <Select defaultValue="medium">
                            <SelectTrigger className="col-span-3" id="priority">
                                <SelectValue placeholder="Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Aşağı</SelectItem>
                                <SelectItem value="medium">Orta</SelectItem>
                                <SelectItem value="high">Yüksək</SelectItem>
                                <SelectItem value="critical">Kritik</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="message" className="text-right">
                            Mesaj
                        </Label>
                        <Textarea
                            id="message"
                            className="col-span-3"
                            placeholder="Təsvir edin..."
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="screenshot" className="text-right">
                            Screenshot
                        </Label>
                        <div className="col-span-3">
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => document.getElementById('screenshot-upload')?.click()}>
                                    <ImagePlus className="w-4 h-4 mr-2" />
                                    Şəkil Yüklə
                                </Button>
                                <input
                                    id="screenshot-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            toast.info("Şəkil seçildi: " + e.target.files[0].name);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-xs text-muted-foreground">
                            Kontekst
                        </Label>
                        <code className="col-span-3 text-[10px] bg-muted p-1 rounded font-mono block overflow-hidden text-ellipsis whitespace-nowrap">
                            {location.pathname}
                        </code>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Göndər</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
