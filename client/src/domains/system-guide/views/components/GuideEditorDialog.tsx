import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import type { GuideNode } from "../data/guide-data";

interface GuideEditorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: GuideNode | null;
    onSave: (data: GuideNode) => void;
    // parentId?: string; // Future Use
}

export function GuideEditorDialog({ open, onOpenChange, initialData, onSave }: GuideEditorDialogProps) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<"module" | "submodule" | "article">("article");
    const [content, setContent] = useState("");
    const [videoProvider, setVideoProvider] = useState<"youtube" | "upload">("youtube");
    const [videoUrl, setVideoUrl] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");

    useEffect(() => {
        if (open && initialData) {
            setTitle(initialData.title);
            setType(initialData.type);
            setContent(initialData.content || "");
            if (initialData.video) {
                setVideoProvider(initialData.video.provider);
                setVideoUrl(initialData.video.embedUrl);
            } else {
                setVideoProvider("youtube");
                setVideoUrl("");
            }
            setTags(initialData.tags || []);
        } else if (open) {
            // Reset for create
            setTitle("");
            setType("article");
            setContent("");
            setVideoProvider("youtube");
            setVideoUrl("");
            setTags([]);
        }
    }, [open, initialData]);

    const handleAddTag = () => {
        if (currentTag && !tags.includes(currentTag)) {
            setTags([...tags, currentTag]);
            setCurrentTag("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSave = () => {
        if (!title) {
            toast.error("Başlıq mütləqdir");
            return;
        }

        const newNode: GuideNode = {
            id: initialData?.id || `new-${Date.now()}`,
            type,
            title,
            content: type === 'article' ? content : undefined,
            tags: tags.length > 0 ? tags : undefined,
            lastUpdated: new Date().toISOString().split('T')[0],
            children: initialData?.children || [], // Keep children if any
            video: videoUrl ? {
                provider: videoProvider,
                embedUrl: videoUrl,
                duration: 0
            } : undefined
        };

        onSave(newNode);
        onOpenChange(false);
        toast.success(initialData ? "Dəyişikliklər yadda saxlanıldı" : "Yeni maddə yaradıldı");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Redaktə Et" : "Yeni Maddə Yarat"}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Növ</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)} disabled={!!initialData}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="module">Modul (Qovluq)</SelectItem>
                                <SelectItem value="submodule">Alt-Modul (Bölmə)</SelectItem>
                                <SelectItem value="article">Məqalə</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Başlıq</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Məs: Yeni İşçi Kartı..." />
                    </div>

                    {type === 'article' && (
                        <>
                            <div className="grid gap-2">
                                <Label>Video Təlimat</Label>
                                <div className="flex gap-2">
                                    <Select value={videoProvider} onValueChange={(v: any) => setVideoProvider(v)}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="youtube">YouTube</SelectItem>
                                            <SelectItem value="upload">Upload</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        value={videoUrl}
                                        onChange={e => setVideoUrl(e.target.value)}
                                        placeholder={videoProvider === 'youtube' ? "https://youtube.com/embed/..." : "/uploads/videos/..."}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Məzmun (Markdown)</Label>
                                <Textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="min-h-[200px] font-mono text-sm"
                                    placeholder="# Məqalə başlığı..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Teqlər</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={currentTag}
                                        onChange={e => setCurrentTag(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                        placeholder="Tag əlavə et..."
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                            {tag}
                                            <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveTag(tag)} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Ləğv Et</Button>
                    <Button onClick={handleSave}>Yadda Saxla</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
