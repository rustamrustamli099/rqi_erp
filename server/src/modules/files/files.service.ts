import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
    private readonly uploadPath = './uploads';

    constructor(private prisma: PrismaService) {
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    async uploadFile(file: Express.Multer.File, userId: string) {
        const filename = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(this.uploadPath, filename);

        // In a real app with Multer, the file is already saved to tmp or disk.
        // If not using diskStorage, we write buffer:
        if (file.buffer) {
            fs.writeFileSync(filePath, file.buffer);
        }

        return this.prisma.file.create({
            data: {
                originalName: file.originalname,
                filename: filename,
                mimeType: file.mimetype,
                size: file.size,
                path: filePath,
                uploadedBy: userId,
                publicUrl: `/uploads/${filename}`, // Nginx or Static Serve
                usage: 'OTHER', // Default usage
                module: 'GENERAL' // Default module
            }
        });
    }

    async findAll() {
        return this.prisma.file.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { fullName: true, email: true } } } // Include uploader info if possible
        });
    }
}
