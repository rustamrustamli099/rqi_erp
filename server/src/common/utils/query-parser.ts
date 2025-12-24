import { ListQueryDto } from '../dto/pagination.dto';

export class QueryParser {
    static parse(dto: ListQueryDto, allowedSorts: string[] = ['createdAt']) {
        const page = Number(dto.page) || 1;
        const pageSize = Number(dto.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // Sort Security: Only allow white-listed fields
        let orderBy: any = {};
        if (dto.sortBy && allowedSorts.includes(dto.sortBy)) {
            orderBy[dto.sortBy] = dto.sortDir?.toLowerCase() || 'desc';
        } else {
            orderBy['createdAt'] = 'desc'; // Default Sort
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
