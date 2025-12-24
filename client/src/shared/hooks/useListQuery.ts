import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export interface ListQueryConfig {
    defaultSortBy?: string;
    defaultSortDir?: 'asc' | 'desc';
    defaultPageSize?: number;
}

export const useListQuery = (config: ListQueryConfig = {}) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Init State from URL or Defaults
    const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
    const [pageSize, setPageSize] = useState<number>(Number(searchParams.get('pageSize')) || config.defaultPageSize || 10);
    const [search, setSearch] = useState<string>(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || config.defaultSortBy || 'createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>((searchParams.get('sortDir') as 'asc' | 'desc') || config.defaultSortDir || 'desc');
    const [filters, setFilters] = useState<Record<string, any>>({});

    // Debounce Search
    const debouncedSearch = useDebounce(search, 500);

    // Sync to URL
    useEffect(() => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);

            if (page > 1) newParams.set('page', page.toString()); else newParams.delete('page');

            if (pageSize !== 10) newParams.set('pageSize', pageSize.toString()); else newParams.delete('pageSize');

            if (debouncedSearch) newParams.set('search', debouncedSearch); else newParams.delete('search');

            if (sortBy !== config.defaultSortBy) newParams.set('sortBy', sortBy); else newParams.delete('sortBy');

            if (sortDir !== config.defaultSortDir) newParams.set('sortDir', sortDir); else newParams.delete('sortDir');

            return newParams;
        }, { replace: true });
    }, [page, pageSize, debouncedSearch, sortBy, sortDir, setSearchParams /* config is stable usually */]);

    // Handlers
    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setPage(1); // Reset to page 1 on search
    }, []);

    const handleSort = useCallback((field: string) => {
        setSortBy(field);
        setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const queryParams = useMemo(() => ({
        page,
        pageSize,
        search: debouncedSearch,
        sortBy,
        sortDir,
        ...filters
    }), [page, pageSize, debouncedSearch, sortBy, sortDir, filters]);

    return {
        page,
        pageSize,
        search,
        debouncedSearch,
        sortBy,
        sortDir,
        filters,
        setPage: handlePageChange,
        setPageSize,
        setSearch: handleSearch,
        setSortBy, // Direct set if needed
        setSortDir,
        toggleSort: handleSort,
        setFilters,
        queryParams
    };
};
