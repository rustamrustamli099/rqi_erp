import { ListQueryDto } from "../dto/pagination.dto";
export declare class QueryParser {
    static parse(query: ListQueryDto, allowedSorts?: string[]): {
        skip: number;
        take: number;
        orderBy: {
            [x: string]: "asc" | "desc";
        };
        page: number;
        pageSize: number;
        search: string | undefined;
        filters: Record<string, any>;
    };
}
