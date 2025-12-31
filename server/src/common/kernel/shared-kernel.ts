
// --- Base Entity ---
export abstract class BaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id || crypto.randomUUID();
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}

// --- Domain Event Base ---
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string;

  constructor(eventName: string) {
    this.occurredOn = new Date();
    this.eventName = eventName;
  }
}

// --- Result Pattern ---
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error?: string | object;
  private _value?: T;

  private constructor(isSuccess: boolean, error?: string | object, value?: T) {
    if (isSuccess && error) {
      throw new Error("InvalidOperation: A result cannot be successful and contain an error");
    }
    if (!isSuccess && !error) {
      throw new Error("InvalidOperation: A failing result needs to contain an error message");
    }
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Can't get the value of an error result. Use 'error' instead.");
    }
    return this._value!;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string | object): Result<U> {
    return new Result<U>(false, error);
  }
}

// --- Simple Event Bus Interface ---
export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}

// --- In-Memory Event Bus Implementation ---
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map();
  private readonly logger = new Logger(InMemoryEventBus.name);

  async publish(event: DomainEvent): Promise<void> {
    this.logger.debug(`Publishing event: ${event.eventName}`);
    const handlers = this.handlers.get(event.eventName);
    if (handlers) {
        // Execute handlers in parallel, but handle errors individually
        await Promise.all(handlers.map(handler => handler(event).catch(err => {
            this.logger.error(`Error in event handler for ${event.eventName}:`, err);
        })));
    }
  }

  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)?.push(handler);
    this.logger.log(`Subscribed to event: ${eventName}`);
  }
}
