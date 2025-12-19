import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useHelp } from "@/app/context/HelpContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function FloatingHelpButton() {
    const { toggleHelp } = useHelp();

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Button
                        className="fixed bottom-24 right-6 rounded-full shadow-lg z-50 w-12 h-12 p-0 bg-sky-600 hover:bg-sky-700 animate-in zoom-in duration-300 hover:scale-105 transition-transform"
                        onClick={toggleHelp}
                        size="icon"
                    >
                        <HelpCircle className="w-6 h-6 text-white" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Kömək (Bələdçi)</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
