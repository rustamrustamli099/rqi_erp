"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryParser = void 0;
class QueryParser {
    static parse(query, allowedSorts = ['createdAt']) {
        const page = Math.max(1, Number(query.page) || 1);
        let pageSize = Number(query.pageSize) || 20;
        if (![10, 20, 50].includes(pageSize)) {
            console.warn(`[QueryParser] Invalid pageSize ${pageSize} requested. Resetting to 20.`);
            pageSize = 20;
        }
        let search = query.search ? query.search.trim() : undefined;
        if (search === "")
            search = undefined;
        if (search && search.length > 100)
            search = search.substring(0, 100);
        let sortBy = query.sortBy;
        let sortDir = (query.sortDir || 'desc').toLowerCase();
        if (sortBy && !allowedSorts.includes(sortBy)) {
            console.warn(`[QueryParser] Invalid sort field '${sortBy}'. Defaulting to 'createdAt'.`);
            sortBy = 'createdAt';
        }
        if (!sortBy)
            sortBy = 'createdAt';
        let filters = {};
        if (query.filters) {
            if (typeof query.filters === 'string') {
                try {
                    filters = JSON.parse(query.filters);
                }
                catch (e) {
                    console.error("[QueryParser] Valid JSON expected for filters", e);
                }
            }
            else {
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
exports.QueryParser = QueryParser;
//# sourceMappingURL=query-parser.js.map