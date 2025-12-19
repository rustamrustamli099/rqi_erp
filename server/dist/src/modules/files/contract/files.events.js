"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadedEvent = void 0;
const domain_event_base_1 = require("../../../shared-kernel/event-bus/domain-event.base");
class FileUploadedEvent extends domain_event_base_1.DomainEvent {
    fileId;
    payload;
    static EVENT_NAME = 'files.uploaded';
    eventName = FileUploadedEvent.EVENT_NAME;
    constructor(fileId, payload, metadata) {
        super(fileId, payload, metadata);
        this.fileId = fileId;
        this.payload = payload;
    }
}
exports.FileUploadedEvent = FileUploadedEvent;
//# sourceMappingURL=files.events.js.map