
import { DomainEvent } from '../../../shared-kernel/event-bus/domain-event.base';

export class FileUploadedEvent extends DomainEvent {
    public static readonly EVENT_NAME = 'files.uploaded';
    public readonly eventName = FileUploadedEvent.EVENT_NAME;

    constructor(
        public readonly fileId: string,
        public readonly payload: {
            filename: string;
            path: string;
            mimeType: string;
            size: number;
            url: string;
        },
        metadata?: any
    ) {
        super(fileId, payload, metadata);
    }
}
