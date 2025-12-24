import { ListQueryDto } from '../dto/pagination.dto';
export declare class QueryParser {
    static parse(dto: ListQueryDto, allowedSorts?: string[]): {
        skip: number;
        take: number;
        orderBy: any;
        page: number;
        pageSize: number;
        search: string | undefined;
    };
}
