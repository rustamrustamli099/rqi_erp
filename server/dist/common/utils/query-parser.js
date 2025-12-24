"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryParser = void 0;
class QueryParser {
    static parse(dto, allowedSorts = ['createdAt']) {
        const page = Number(dto.page) || 1;
        const pageSize = Number(dto.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        let orderBy = {};
        if (dto.sortBy && allowedSorts.includes(dto.sortBy)) {
            orderBy[dto.sortBy] = dto.sortDir?.toLowerCase() || 'desc';
        }
        else {
            orderBy['createdAt'] = 'desc';
        }
        return {
            skip,
            take,
            orderBy,
            page,
            pageSize,
            search: dto.search ? dto.search.trim() : undefined
        };
    }
}
exports.QueryParser = QueryParser;
//# sourceMappingURL=query-parser.js.map