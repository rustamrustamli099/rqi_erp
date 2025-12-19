import type { IStorageProvider } from '../domain/storage.interface';
import { PrismaFileRepository } from '../infrastructure/persistence/prisma-file.repository';
import { FileEntity } from '../domain/file.entity';
export declare class FilesUseCase {
    private readonly storageProvider;
    private readonly fileRepository;
    constructor(storageProvider: IStorageProvider, fileRepository: PrismaFileRepository);
    uploadFile(file: Express.Multer.File, userId: string): Promise<FileEntity>;
}
