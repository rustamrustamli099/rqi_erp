"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileEntity = void 0;
const aggregate_root_1 = require("../../../shared-kernel/base-entities/aggregate-root");
class FileEntity extends aggregate_root_1.AggregateRoot {
    id;
    originalName;
    filename;
    mimeType;
    size;
    path;
    publicUrl;
    uploadedBy;
    createdAt;
    constructor(id, originalName, filename, mimeType, size, path, publicUrl, uploadedBy, createdAt) {
        super();
        this.id = id;
        this.originalName = originalName;
        this.filename = filename;
        this.mimeType = mimeType;
        this.size = size;
        this.path = path;
        this.publicUrl = publicUrl;
        this.uploadedBy = uploadedBy;
        this.createdAt = createdAt;
    }
}
exports.FileEntity = FileEntity;
//# sourceMappingURL=file.entity.js.map