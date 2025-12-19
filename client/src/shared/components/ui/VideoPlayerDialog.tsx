
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface VideoPlayerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    videoUrl: string; // Can be internal URL or YouTube embed URL
    sourceType: 'internal' | 'youtube' | 'vimeo';
}

export function VideoPlayerDialog({ open, onOpenChange, title, videoUrl, sourceType }: VideoPlayerDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black/95 border-none shadow-2xl">
                <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                    <DialogTitle className="text-white/90 text-lg drop-shadow-md">{title}</DialogTitle>
                    <DialogDescription className="sr-only">Video Player</DialogDescription>
                </DialogHeader>

                <div className="aspect-video w-full bg-black flex items-center justify-center">
                    {sourceType === 'youtube' ? (
                        <iframe
                            className="w-full h-full"
                            src={videoUrl}
                            title={title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            controls
                            autoPlay
                            className="w-full h-full"
                            src={videoUrl}
                        >
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
