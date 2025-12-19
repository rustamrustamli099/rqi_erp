import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface FeedbackTooltipProps {
    children: React.ReactNode
    content: string | React.ReactNode
    disabled?: boolean
}

export function FeedbackTooltip({ children, content, disabled = false }: FeedbackTooltipProps) {
    if (!content) return <>{children}</>

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <span className={disabled ? "cursor-not-allowed opacity-70" : ""}>
                        {children}
                    </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px] break-words bg-popover text-popover-foreground border shadow-md p-3">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <div className="text-sm">{content}</div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
