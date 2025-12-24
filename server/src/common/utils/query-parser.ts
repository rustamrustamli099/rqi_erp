
import { ListQueryDto } from "../dto/pagination.dto";

export class QueryParser {
    /**
     * Parse and Sanitize ListQueryDto into Prisma-compatible arguments.
     * @param query Raw query DTO from controller
     * @param allowedSorts Whitelist of sortable fields (e.g. ['name', 'createdAt'])
     * @returns { skip, take, orderBy, page, pageSize, search, filters }
     */
    static parse(query: ListQueryDto, allowedSorts: string[] = ['createdAt']) {
        // 1. Defaults & Limits
        const page = Math.max(1, Number(query.page) || 1);

        // Strict PageSize Check (Fail-safe: If validation bypassed, force correct values)
        let pageSize = Number(query.pageSize) || 20;
        if (![10, 20, 50].includes(pageSize)) {
            console.warn(`[QueryParser] Invalid pageSize ${pageSize} requested. Resetting to 20.`);
            pageSize = 20;
        }

        // 2. Search Sanitization
        let search = query.search ? query.search.trim() : undefined;
        if (search === "") search = undefined;
        if (search && search.length > 100) search = search.substring(0, 100); // Truncate abuse

        // 3. Sorting Logic
        let sortBy = query.sortBy;
        let sortDir = (query.sortDir || 'desc').toLowerCase() as 'asc' | 'desc';

        if (sortBy && !allowedSorts.includes(sortBy)) {
            console.warn(`[QueryParser] Invalid sort field '${sortBy}'. Defaulting to 'createdAt'.`);
            sortBy = 'createdAt';
        }
        if (!sortBy) sortBy = 'createdAt';

        // 4. Filter Parsing
        let filters: Record<string, any> = {};
        if (query.filters) {
            if (typeof query.filters === 'string') {
                try {
                    filters = JSON.parse(query.filters);
                } catch (e) {
                    console.error("[QueryParser] Valid JSON expected for filters", e);
                }
            } else {
                filters = query.filters;
            }
        }

        return {
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { [sortBy]: sortDir },
            page,
            pageSize,
            search,
            filters
        };
    }
}
