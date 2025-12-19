
import { Injectable } from '@nestjs/common';
import { IStorageProvider } from '../../domain/storage.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
    private readonly uploadDir = './uploads';

    constructor() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async upload(file: Express.Multer.File, filename: string): Promise<{ path: string; publicUrl: string }> {
        const filePath = path.join(this.uploadDir, filename);
        if (file.buffer) {
            fs.writeFileSync(filePath, file.buffer);
        }
        // In local logic, publicUrl might be relative
        return { path: filePath, publicUrl: `/uploads/${filename}` };
    }

    async delete(filePath: string): Promise<void> {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}
