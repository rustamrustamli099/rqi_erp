import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ScrollableTabsProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export function ScrollableTabs({ children, className, ...props }: ScrollableTabsProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [showLeft, setShowLeft] = React.useState(false)
    const [showRight, setShowRight] = React.useState(true)

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setShowLeft(scrollLeft > 0)
            setShowRight(scrollLeft < scrollWidth - clientWidth - 5) // 5px buffer
        }
    }

    React.useEffect(() => {
        checkScroll()
        window.addEventListener("resize", checkScroll)
        return () => window.removeEventListener("resize", checkScroll)
    }, [])

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 200
            const newScrollLeft = direction === "left"
                ? scrollRef.current.scrollLeft - scrollAmount
                : scrollRef.current.scrollLeft + scrollAmount

            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth"
            })
        }
    }

    return (
        <div className={cn("relative flex items-center", className)} {...props}>
            {showLeft && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 z-10 h-full w-8 bg-background/80 backdrop-blur-sm rounded-r-none border-r hover:bg-background"
                    onClick={() => scroll("left")}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            )}

            <div
                ref={scrollRef}
                className="flex w-full overflow-x-auto scrollbar-hide items-center snap-x"
                onScroll={checkScroll}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children}
            </div>

            {showRight && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 z-10 h-full w-8 bg-background/80 backdrop-blur-sm rounded-l-none border-l hover:bg-background"
                    onClick={() => scroll("right")}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
