import { IStorageProvider } from '../../domain/storage.interface';
export declare class LocalStorageProvider implements IStorageProvider {
    private readonly uploadDir;
    constructor();
    upload(file: Express.Multer.File, filename: string): Promise<{
        path: string;
        publicUrl: string;
    }>;
    delete(filePath: string): Promise<void>;
}
