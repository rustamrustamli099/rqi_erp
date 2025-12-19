export declare abstract class BaseEntity {
    readonly id: string;
    readonly createdAt: Date;
    updatedAt: Date;
    constructor(id?: string, createdAt?: Date, updatedAt?: Date);
}
export declare abstract class DomainEvent {
    readonly occurredOn: Date;
    readonly eventName: string;
    constructor(eventName: string);
}
export declare class Result<T> {
    isSuccess: boolean;
    isFailure: boolean;
    error?: string | object;
    private _value?;
    private constructor();
    getValue(): T;
    static ok<U>(value?: U): Result<U>;
    static fail<U>(error: string | object): Result<U>;
}
export interface IEventBus {
    publish(event: DomainEvent): Promise<void>;
    subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}
export declare class InMemoryEventBus implements IEventBus {
    private handlers;
    private readonly logger;
    publish(event: DomainEvent): Promise<void>;
    subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}
