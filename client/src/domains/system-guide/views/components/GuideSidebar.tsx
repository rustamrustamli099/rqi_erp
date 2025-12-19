
import type { GuideNode } from "../data/guide-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, FileText, Folder } from "lucide-react";

interface GuideSidebarProps {
    data: GuideNode[];
    activeNodeId?: string;
    onSelect: (node: GuideNode) => void;
}

export default function GuideSidebar({ data, activeNodeId, onSelect }: GuideSidebarProps) {
    return (
        <aside className="w-full h-full border-r bg-muted/10 overflow-y-auto p-4  custom-scrollbar">
            <h3 className="mb-4 text-lg font-semibold tracking-tight px-2">Kataloq</h3>
            <div className="space-y-1">
                {data.map((node) => (
                    <GuideTreeItem
                        key={node.id}
                        node={node}
                        activeNodeId={activeNodeId}
                        onSelect={onSelect}
                        level={0}
                    />
                ))}
            </div>
        </aside>
    );
}

function GuideTreeItem({ node, activeNodeId, onSelect, level }: {
    node: GuideNode,
    activeNodeId?: string,
    onSelect: (n: GuideNode) => void,
    level: number
}) {
    const hasChildren = node.children && node.children.length > 0;
    const isActive = activeNodeId === node.id;
    const Icon = node.icon || (hasChildren ? Folder : FileText);

    if (hasChildren) {
        return (
            <Accordion type="single" collapsible className="w-full border-none">
                <AccordionItem value={node.id} className="border-none">
                    <AccordionTrigger className={cn(
                        "py-2 px-2 hover:bg-muted/50 rounded-md text-sm font-medium transition-colors hover:no-underline",
                        level > 0 && "pl-4"
                    )}>
                        <div className="flex items-center gap-2 text-left">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span>{node.title}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pl-4 border-l ml-3 my-1">
                        {node.children?.map(child => (
                            <GuideTreeItem
                                key={child.id}
                                node={child}
                                activeNodeId={activeNodeId}
                                onSelect={onSelect}
                                level={level + 1}
                            />
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(node)}
            className={cn(
                "w-full justify-start font-normal h-9 mb-1",
                isActive ? "bg-primary/10 text-primary font-medium hover:bg-primary/15" : "text-muted-foreground"
            )}
        >
            <div className="flex items-center gap-2 overflow-hidden w-full">
                {level > 0 && <span className="w-1" />}
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className="truncate">{node.title}</span>
            </div>
        </Button>
    );
}
