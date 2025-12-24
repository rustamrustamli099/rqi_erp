
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/shared/hooks/useDebounce"; // Ensure this exists or use utility

export interface ListQueryConfig {
    defaultPage?: number;
    defaultPageSize?: number;
    defaultSortBy?: string;
    defaultSortDir?: 'asc' | 'desc';
    defaultFilters?: Record<string, string>;
}

export function useListQuery(config: ListQueryConfig = {}) {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Raw State (Canonical Source is URL)
    const page = Number(searchParams.get("page")) || config.defaultPage || 1;
    const pageSize = Number(searchParams.get("pageSize")) || config.defaultPageSize || 20;
    const sortBy = searchParams.get("sortBy") || config.defaultSortBy || "createdAt";
    const sortDir = (searchParams.get("sortDir") || config.defaultSortDir || "desc") as 'asc' | 'desc';

    // Search is special: we need local state for input readiness + debounced URL update
    const urlSearch = searchParams.get("search") || "";
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Filters Parsing (filters[status]=APPROVED)
    const filters = useMemo(() => {
        const f: Record<string, any> = {};
        searchParams.forEach((value, key) => {
            if (key.startsWith("filters[")) {
                // filters[status] -> status
                const match = key.match(/filters\[(.*?)\]/);
                if (match) f[match[1]] = value;
            }
        });
        return { ...config.defaultFilters, ...f };
    }, [searchParams, config.defaultFilters]);

    // 2. Sync Debounce to URL
    useEffect(() => {
        if (debouncedSearch !== urlSearch) {
            updateParams({ search: debouncedSearch, page: 1 }); // Reset page on search
        }
    }, [debouncedSearch]);

    // 3. Setters (State Mutations)
    const updateParams = (updates: Record<string, any>) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);

            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === undefined || value === "") {
                    newParams.delete(key);
                } else if (key === 'filters') {
                    // Handle complex filters object
                    // Clear old filters first? No, merge.
                    // Actually, for safety, if passing bulk filters, we might want to spread them.
                    // Implementation: Passing { filters: { status: 'X' } }
                    Object.entries(value).forEach(([fKey, fVal]) => {
                        if (fVal === null || fVal === undefined || fVal === "") {
                            newParams.delete(`filters[${fKey}]`);
                        } else {
                            newParams.set(`filters[${fKey}]`, String(fVal));
                        }
                    });
                } else {
                    newParams.set(key, String(value));
                }
            });

            return newParams;
        });
    };

    const setPage = (p: number) => updateParams({ page: p });
    const setPageSize = (ps: number) => updateParams({ pageSize: ps, page: 1 }); // Reset page on size change
    const setSort = (by: string) => {
        const newDir = (by === sortBy && sortDir === 'asc') ? 'desc' : 'asc';
        updateParams({ sortBy: by, sortDir: newDir });
    };
    const setFilter = (key: string, value: string | null) => updateParams({ filters: { [key]: value }, page: 1 });
    const handleSearch = (val: string) => setSearchTerm(val);

    // 4. Reset
    const reset = () => {
        setSearchParams(new URLSearchParams());
        setSearchTerm("");
    };

    // 5. Output Object (API Ready)
    const query = useMemo(() => ({
        page,
        pageSize,
        sortBy,
        sortDir,
        search: urlSearch || undefined, // Send undefined if empty to clean API calls
        filters
    }), [page, pageSize, sortBy, sortDir, urlSearch, filters]);

    return {
        // State
        page,
        pageSize,
        sortBy,
        sortDir,
        filters,
        searchTerm, // For Input value
        query,      // For API call

        // Actions
        setPage,
        setPageSize,
        setSort,
        setFilter,
        setSearch: handleSearch,
        reset
    };
}
