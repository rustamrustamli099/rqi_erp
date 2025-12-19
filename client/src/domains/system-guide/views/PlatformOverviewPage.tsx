
import React, { useState } from "react";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { guideData } from "./data/guide-data";
import type { GuideNode } from "./data/guide-data";
import GuideSidebar from "./components/GuideSidebar";
import ArticleViewer from "./components/ArticleViewer";
import { GuideEditorDialog } from "./components/GuideEditorDialog";
import { toast } from "sonner";

export default function PlatformOverviewPage() {
    const [activeNode, setActiveNode] = useState<GuideNode | undefined>(
        // Default to first article of first module
        guideData[0]?.children?.[0]?.children?.[0]
    );

    // Editor State
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
    const [editingNode, setEditingNode] = useState<GuideNode | undefined>(undefined);

    const handleSelect = (node: GuideNode) => {
        if (node.type === 'article') {
            setActiveNode(node);
        }
    };

    const handleCreate = () => {
        setEditorMode('create');
        setEditingNode(undefined);
        setEditorOpen(true);
    };

    const handleEdit = (node: GuideNode) => {
        setEditorMode('edit');
        setEditingNode(node);
        setEditorOpen(true);
    };

    const handleSave = (data: GuideNode) => {
        console.log("Saving article data:", data);
        toast.success(editorMode === 'create' ? "Məqalə yaradıldı" : "Məqalə yeniləndi", {
            description: "Dəyişikliklər sistemə qeyd olundu."
        });
        setEditorOpen(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-65px)] animate-in fade-in duration-500 overflow-hidden">
            {/* Header Toolbar */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 flex items-center justify-between shrink-0 z-10">
                <div>
                    <PageHeader
                        heading="Sistem Bələdçisi"
                        text=""
                        className="pb-0 border-none mb-0"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Enterprise bilik bazası və təlimat mərkəzi</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Axtarış..." className="pl-8" />
                    </div>
                    <Button onClick={handleCreate}>
                        <PlusCircle className="w-4 h-4 mr-2" /> Yeni Məqalə
                    </Button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Tree */}
                <div className="w-80 flex-shrink-0 h-full overflow-hidden border-r">
                    <GuideSidebar
                        data={guideData}
                        activeNodeId={activeNode?.id}
                        onSelect={handleSelect}
                    />
                </div>

                {/* Content Area */}
                <main className="flex-1 h-full overflow-y-auto bg-muted/5 p-8 scroll-smooth">
                    {activeNode ? (
                        <ArticleViewer
                            article={activeNode}
                            onEdit={handleEdit}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                            <Search className="w-16 h-16 opacity-20" />
                            <p className="text-lg font-medium">Başlamaq üçün sol menyudan məqalə seçin</p>
                        </div>
                    )}
                </main>
            </div>

            <GuideEditorDialog
                open={editorOpen}
                onOpenChange={setEditorOpen}
                initialData={editingNode}
                onSave={handleSave}
            />
        </div>
    )
}
