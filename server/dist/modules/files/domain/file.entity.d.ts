import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';
export declare class FileEntity extends AggregateRoot<FileEntity> {
    readonly id: string;
    originalName: string;
    filename: string;
    mimeType: string;
    size: number;
    path: string;
    publicUrl: string;
    uploadedBy: string;
    readonly createdAt: Date;
    constructor(id: string, originalName: string, filename: string, mimeType: string, size: number, path: string, publicUrl: string, uploadedBy: string, createdAt: Date);
}
