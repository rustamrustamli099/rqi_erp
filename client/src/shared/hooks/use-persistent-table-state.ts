
import { useState, useEffect } from "react"
import type { VisibilityState, ColumnOrderState } from "@tanstack/react-table"

interface UsePersistentTableStateProps {
    key: string
    initialVisibility?: VisibilityState
    initialOrder?: ColumnOrderState
}

export function usePersistentTableState({ key, initialVisibility = {}, initialOrder = [] }: UsePersistentTableStateProps) {
    // Helper to load from local storage
    const loadState = () => {
        if (typeof window === "undefined") return { visibility: initialVisibility, order: initialOrder }

        try {
            const savedItem = localStorage.getItem(`table_settings_${key}`)
            if (savedItem) {
                return JSON.parse(savedItem)
            }
        } catch (e) {
            console.warn("Failed to load table settings:", e)
        }
        return { visibility: initialVisibility, order: initialOrder }
    }

    const [savedState] = useState(loadState())

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(savedState.visibility)
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(savedState.order)

    // Save whenever state changes
    useEffect(() => {
        const settings = {
            visibility: columnVisibility,
            order: columnOrder
        }
        localStorage.setItem(`table_settings_${key}`, JSON.stringify(settings))
    }, [columnVisibility, columnOrder, key])

    return {
        columnVisibility,
        setColumnVisibility,
        columnOrder,
        setColumnOrder
    }
}
