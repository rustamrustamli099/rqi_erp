import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useHelp } from "@/app/context/HelpContext";
import GuideSidebar from "./components/GuideSidebar";
import ArticleViewer from "./components/ArticleViewer";
import { guideData as initialData, type GuideNode } from "./data/guide-data";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Plus, Pencil } from "lucide-react";
import { GuideEditorDialog } from "./components/GuideEditorDialog";
import { toast } from "sonner";

export function GuideDrawer() {
    const { isOpen, closeHelp, pageKey } = useHelp();
    const [selectedNode, setSelectedNode] = useState<GuideNode | null>(null);
    const [view, setView] = useState<"sidebar" | "article">("sidebar");

    // Editor State
    const [guideData, setGuideData] = useState<GuideNode[]>(initialData);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<GuideNode | null>(null);

    // Filtered data for context-aware display
    const [filteredData, setFilteredData] = useState<GuideNode[]>(initialData);

    // Auto-select node and Filter Tree based on pageKey
    useEffect(() => {
        if (isOpen && pageKey) {
            // 1. Find the root module that contains the requested key (Context Awareness)
            const containsKey = (node: GuideNode, key: string): boolean => {
                if (node.id === key) return true;
                if (node.children) return node.children.some(child => containsKey(child, key));
                return false;
            };

            const relevantRoot = guideData.find(root => containsKey(root, pageKey));

            // If we found a relevant module, show ONLY that module. Otherwise show all.
            setFilteredData(relevantRoot ? [relevantRoot] : guideData);

            // 2. Find and select the specific node
            const findNode = (nodes: GuideNode[], id: string): GuideNode | null => {
                for (const node of nodes) {
                    if (node.id === id) return node;
                    if (node.children) {
                        const found = findNode(node.children, id);
                        if (found) return found;
                    }
                }
                return null;
            };

            const node = relevantRoot ? findNode([relevantRoot], pageKey) : findNode(guideData, pageKey);

            if (node) {
                setSelectedNode(node);
                if (node.type === 'article') {
                    setView("article");
                }
            }
        } else if (!isOpen) {
            // Reset filter? Optional. 
        }
    }, [isOpen, pageKey, guideData]);

    const handleSelect = (node: GuideNode) => {
        setSelectedNode(node);
        if (node.type === 'article') {
            setView("article");
        }
    };

    const handleCreateNew = () => {
        setEditingNode(null);
        setIsEditorOpen(true);
    };

    const handleEditCurrent = () => {
        if (selectedNode) {
            setEditingNode(selectedNode);
            setIsEditorOpen(true);
        }
    };

    const handleSaveNode = (newNode: GuideNode) => {
        // Mock Update Logic - In real app, this would be an API call
        const updateNodes = (nodes: GuideNode[]): GuideNode[] => {
            return nodes.map(node => {
                if (node.id === newNode.id) return { ...node, ...newNode };
                if (node.children) return { ...node, children: updateNodes(node.children) };
                return node;
            });
        };

        if (editingNode) {
            // Update existing
            setGuideData(prev => updateNodes(prev));
            setSelectedNode(newNode); // Update current view
        } else {
            // Add new (Simple push to top level or active module for demo)
            setGuideData(prev => [...prev, newNode]);
        }

        // Force update local data ref if needed or just rely on state
    };


    return (
        <Sheet open={isOpen} onOpenChange={closeHelp}>
            <SheetContent className="sm:max-w-xl p-0 flex flex-col w-[500px]">
                <div className="p-4 border-b flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-lg">Sistem Bələdçisi</h2>
                    </div>

                    <div className="flex gap-1">
                        {view === 'article' && selectedNode && (
                            <Button variant="ghost" size="icon" onClick={handleEditCurrent} title="Redaktə et">
                                <Pencil className="w-4 h-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={handleCreateNew} title="Yeni Məqalə">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {/* View Switcher/Navigation (if deep in article) */}
                    {view === 'article' && (
                        <div className="absolute top-2 left-2 z-10">
                            <Button variant="outline" size="sm" onClick={() => setView("sidebar")} className="bg-background/80 backdrop-blur">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Geri
                            </Button>
                        </div>
                    )}

                    {view === 'sidebar' ? (
                        <GuideSidebar
                            data={filteredData}
                            activeNodeId={selectedNode?.id}
                            onSelect={handleSelect}
                        />
                    ) : (
                        <div className="h-full overflow-y-auto p-4 pt-12">
                            {selectedNode && (
                                <ArticleViewer
                                    article={selectedNode}
                                    onEdit={handleEditCurrent}
                                />
                            )}
                        </div>
                    )}
                </div>

                <GuideEditorDialog
                    open={isEditorOpen}
                    onOpenChange={setIsEditorOpen}
                    initialData={editingNode}
                    onSave={handleSaveNode}
                />
            </SheetContent>
        </Sheet>
    );
}
