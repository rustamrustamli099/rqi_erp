import { PrismaService } from '../../../../prisma.service';
import { FileEntity } from '../../domain/file.entity';
export declare class PrismaFileRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(file: FileEntity): Promise<FileEntity>;
    private mapToDomain;
}
