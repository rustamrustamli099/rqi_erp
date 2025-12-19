import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { HelpCircle, PlayCircle, BookOpen } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ContextHelpProps {
    title: string;
    description: string;
    videoUrl?: string;
    articleUrl?: string;
}

export function ContextHelp({ title, description, videoUrl, articleUrl }: ContextHelpProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">Kömək</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b bg-muted/30">
                    <h4 className="font-semibold leading-none flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        {title}
                    </h4>
                </div>
                <ScrollArea className="h-auto max-h-[300px]">
                    <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {description}
                        </p>

                        {(videoUrl || articleUrl) && (
                            <div className="flex flex-col gap-2 pt-2">
                                {videoUrl && (
                                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-auto py-2" onClick={() => window.open(videoUrl, '_blank')}>
                                        <PlayCircle className="w-4 h-4 text-red-500" />
                                        <span>Video İzah</span>
                                    </Button>
                                )}
                                {articleUrl && (
                                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-auto py-2" onClick={() => window.open(articleUrl, '_blank')}>
                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                        <span>Sənədləri Oxu</span>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-2 border-t bg-muted/10 text-[10px] text-center text-muted-foreground">
                    RQI ERP Help System
                </div>
            </PopoverContent>
        </Popover>
    )
}
