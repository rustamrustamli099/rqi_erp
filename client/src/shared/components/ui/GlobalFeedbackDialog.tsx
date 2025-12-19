import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

export function GlobalFeedbackDialog({ collapsed }: { collapsed?: boolean }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState("suggestion");
    const [severity, setSeverity] = useState("low");
    const location = useLocation();

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.error("Zəhmət olmasa rəyinizi yazın");
            return;
        }

        setLoading(true);

        // Mock API call
        console.log({
            url: location.pathname,
            type,
            severity,
            message,
            timestamp: new Date().toISOString()
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        toast.success("Rəyiniz qəbul edildi. Təşəkkür edirik!");
        setOpen(false);
        setLoading(false);
        setMessage("");
        setType("suggestion");
        setSeverity("low");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {collapsed ? (
                    <Button variant="ghost" size="icon" className="w-full h-10 mb-1 hover:bg-muted/50" title="Feedback">
                        <MessageSquare className="w-5 h-5 shrink-0" />
                    </Button>
                ) : (
                    <Button variant="outline" className="w-full justify-start gap-3 mb-2 h-10 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground transition-colors px-4">
                        <MessageSquare className="w-5 h-5 shrink-0" />
                        <span className="truncate font-medium">Feedback</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[85vh] overflow-hidden p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Sistem Rəyi</DialogTitle>
                    <DialogDescription>
                        Fikir və təklifləriniz sistemi təkmilləşdirməyə kömək edir.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-2 grid gap-4">
                    <div className="grid gap-2">
                        <Label>Səhifə Konteksti</Label>
                        <div className="text-xs font-mono bg-muted/50 p-2.5 rounded border text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            {location.pathname}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Növ</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="suggestion">💡 Təklif</SelectItem>
                                    <SelectItem value="bug">🐛 Xəta (Bug)</SelectItem>
                                    <SelectItem value="ux">🎨 Dizayn / UX</SelectItem>
                                    <SelectItem value="other">📝 Digər</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="severity">Vaciblik</Label>
                            <Select value={severity} onValueChange={setSeverity}>
                                <SelectTrigger id="severity">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">🟢 Aşağı</SelectItem>
                                    <SelectItem value="medium">🟡 Orta</SelectItem>
                                    <SelectItem value="high">🔴 Yüksək</SelectItem>
                                    <SelectItem value="critical">🔥 Kritik</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="message">Mesajınız</Label>
                        <Textarea
                            id="message"
                            placeholder="Zəhmət olmasa fikrinizi ətraflı izah edin..."
                            className="min-h-[120px] resize-none focus-visible:ring-primary"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" className="w-full gap-2 text-xs" onClick={() => toast.info("Screenshot upload module pending backend integration")}>
                            <Camera className="w-3.5 h-3.5" />
                            Screenshot əlavə et
                        </Button>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 sm:justify-between border-t bg-muted/10">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Ləğv et</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Göndər
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
