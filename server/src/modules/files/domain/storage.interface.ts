
export interface IStorageProvider {
    upload(file: Express.Multer.File, filename: string): Promise<{ path: string; publicUrl: string }>;
    delete(path: string): Promise<void>;
}
