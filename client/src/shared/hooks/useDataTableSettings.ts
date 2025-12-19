import { useState, useEffect } from "react"
import type { VisibilityState } from "@tanstack/react-table"

export function useDataTableSettings(tableId: string, initialVisibility: VisibilityState = {}) {
    const storageKey = `datatable-visibility-${tableId}`

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(storageKey)
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (e) {
                    console.error("Failed to parse saved column visibility:", e)
                }
            }
        }
        return initialVisibility
    })

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(storageKey, JSON.stringify(columnVisibility))
        }
    }, [columnVisibility, storageKey])

    return {
        columnVisibility,
        setColumnVisibility
    }
}
