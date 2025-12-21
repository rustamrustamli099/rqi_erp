import { DomainEvent } from '../../../shared-kernel/event-bus/domain-event.base';
export declare class FileUploadedEvent extends DomainEvent {
    readonly fileId: string;
    readonly payload: {
        filename: string;
        path: string;
        mimeType: string;
        size: number;
        url: string;
    };
    static readonly EVENT_NAME = "files.uploaded";
    readonly eventName = "files.uploaded";
    constructor(fileId: string, payload: {
        filename: string;
        path: string;
        mimeType: string;
        size: number;
        url: string;
    }, metadata?: any);
}
