export declare class CacheService {
    private readonly logger;
    private readonly store;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
    del(key: string): Promise<void>;
    delByPrefix(prefix: string): Promise<number>;
    reset(): Promise<void>;
    size(): Promise<number>;
}
