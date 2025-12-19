
import { AggregateRoot } from '../../../shared-kernel/base-entities/aggregate-root';

export class FileEntity extends AggregateRoot<FileEntity> {
    constructor(
        public readonly id: string,
        public originalName: string,
        public filename: string,
        public mimeType: string,
        public size: number,
        public path: string,
        public publicUrl: string,
        public uploadedBy: string,
        public readonly createdAt: Date,
    ) {
        super();
    }
}
