
import type { GuideNode } from "../data/guide-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Calendar, Edit, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface ArticleViewerProps {
    article: GuideNode;
    onEdit?: (article: GuideNode) => void;
}

export default function ArticleViewer({ article, onEdit }: ArticleViewerProps) {
    const [copied, setCopied] = React.useState(false);

    if (!article) return <div className="p-8 text-center text-muted-foreground">Məqalə seçilməyib</div>;

    const handleShare = () => {
        // Mock link copying
        const link = `${window.location.origin}/admin/system?tab=${article.id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success("Link kopyalandı", {
            description: "Məqalənin keçidi mübadilə buferinə əlavə olundu."
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="border-b pb-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-muted-foreground">
                        {article.id.split('-')[0].toUpperCase()}
                    </Badge>
                    {article.lastUpdated && (
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            Son yenilənmə: {article.lastUpdated}
                        </div>
                    )}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{article.title}</h1>

                {article.tags && article.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                        {article.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Video Player Section */}
            {article.video && (
                <Card className="overflow-hidden border-none shadow-lg bg-black/5">
                    <CardContent className="p-0">
                        <div className="mb-6 rounded-lg overflow-hidden border bg-black/5 aspect-video relative">
                            {/* YouTube or Uploaded Video Player (Always Embedded) */}
                            <iframe
                                src={article.video.embedUrl}
                                title={article.title}
                                className="w-full h-full absolute inset-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="p-3 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center"><PlayCircle className="w-3 h-3 mr-1" /> Video Təlimat</span>
                            <span>Provider: {article.video.provider}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Content Body */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
                {/* Simple Markdown-like rendering */}
                {article.content?.split('\n').map((paragraph: string, idx: number) => {
                    if (paragraph.startsWith('# ')) return <h1 key={idx} className="text-2xl font-bold mt-6 mb-4">{paragraph.replace('# ', '')}</h1>;
                    if (paragraph.startsWith('## ')) return <h2 key={idx} className="text-xl font-semibold mt-5 mb-3">{paragraph.replace('## ', '')}</h2>;
                    if (paragraph.startsWith('- ')) return <li key={idx} className="ml-4 list-disc">{paragraph.replace('- ', '')}</li>;
                    if (paragraph.startsWith('> ')) return <div key={idx} className="border-l-4 border-primary pl-4 py-2 bg-muted/50 my-4 italic">{paragraph.replace('> ', '')}</div>;
                    if (paragraph.trim() === '') return <div key={idx} className="h-2"></div>;
                    return <p key={idx} className="leading-7 text-foreground/90">{paragraph}</p>;
                })}
            </div>

            {/* Actions Footer */}
            <div className="pt-8 mt-8 border-t flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={handleShare}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                    {copied ? "Kopyalandı" : "Paylaş"}
                </Button>
                {onEdit && (
                    <Button variant="secondary" size="sm" onClick={() => onEdit(article)}>
                        <Edit className="w-4 h-4 mr-2" /> Redaktə Et (Admin)
                    </Button>
                )}
            </div>
        </div>
    );
}


