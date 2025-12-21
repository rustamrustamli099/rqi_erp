import { PrismaService } from '../../../prisma.service';
export declare class MenusUseCase {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSidebar(user: any): Promise<any[]>;
    private enrichMenu;
    private filterMenu;
    createDefaultMenu(): Promise<void>;
}
