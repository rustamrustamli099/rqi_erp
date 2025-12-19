
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Clock, MessageSquare, Send, User, Link as LinkIcon } from "lucide-react";

interface FeedbackItem {
    id: string;
    type: "bug" | "suggestion" | "ux" | "other";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    url: string;
    status: "new" | "in_review" | "in_progress" | "resolved" | "closed";
    createdAt: string;
    user: string;
}

interface FeedbackDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    feedback: FeedbackItem | null;
    onStatusChange: (id: string, status: any) => void;
}

const mockComments = [
    { id: 1, user: "Admin", text: "Checking logs...", time: "2 saat əvvəl", internal: true },
    { id: 2, user: "Kurator", text: "İstifadəçi ilə əlaqə saxlanıldı.", time: "1 saat əvvəl", internal: false },
];

export function FeedbackDetailsDialog({ open, onOpenChange, feedback, onStatusChange }: FeedbackDetailsDialogProps) {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState(mockComments);

    if (!feedback) return null;

    const handleSendComment = () => {
        if (!comment.trim()) return;
        setComments([...comments, {
            id: Date.now(),
            user: "Siz (Admin)",
            text: comment,
            time: "İndi",
            internal: true
        }]);
        setComment("");
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            {feedback.id}
                            <Badge variant="outline">{feedback.type}</Badge>
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground mr-2">Status:</span>
                            <Badge className="capitalize">{feedback.status.replace('_', ' ')}</Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left: Details */}
                    <div className="flex-1 p-6 overflow-y-auto border-b md:border-b-0 md:border-r">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Mövzu / Mesaj</h4>
                                <p className="text-sm bg-muted/30 p-3 rounded-md border">{feedback.message}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-semibold mb-1 text-muted-foreground">Vaciblik</h4>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                                        <span className="capitalize">{feedback.severity}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold mb-1 text-muted-foreground">Kontekst (URL)</h4>
                                    <div className="flex items-center gap-2 text-sm text-blue-600 truncate">
                                        <LinkIcon className="w-3 h-3" />
                                        <span className="truncate">{feedback.url}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold mb-1 text-muted-foreground">İstifadəçi</h4>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4" />
                                        {feedback.user}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold mb-1 text-muted-foreground">Tarix</h4>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4" />
                                        {new Date(feedback.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Statusu Dəyiş</h4>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" onClick={() => onStatusChange(feedback.id, 'in_review')}>In Review</Button>
                                    <Button variant="outline" size="sm" onClick={() => onStatusChange(feedback.id, 'in_progress')}>In Progress</Button>
                                    <Button variant="outline" size="sm" onClick={() => onStatusChange(feedback.id, 'resolved')} className="text-green-600 border-green-200 hover:bg-green-50">Resolve</Button>
                                    <Button variant="outline" size="sm" onClick={() => onStatusChange(feedback.id, 'closed')}>Close</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Comments / Notes */}
                    <div className="w-full md:w-[300px] flex flex-col bg-muted/10">
                        <div className="p-3 border-b bg-muted/20 font-semibold text-xs flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" /> Daxili Qeydlər & Çat
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {comments.map((c) => (
                                    <div key={c.id} className={`flex flex-col gap-1 text-sm ${c.internal ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <span className="font-bold">{c.user}</span>
                                            <span>{c.time}</span>
                                            {c.internal && <Badge variant="secondary" className="text-[8px] h-3 px-1">Internal</Badge>}
                                        </div>
                                        <div className={`p-2 rounded-lg max-w-[90%] ${c.internal ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                                            {c.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-3 border-t bg-background">
                            <div className="flex gap-2">
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Daxili qeyd yazın..."
                                    className="min-h-[60px] resize-none text-xs"
                                />
                                <Button size="icon" className="h-[60px] w-10 shrink-0" onClick={handleSendComment}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
