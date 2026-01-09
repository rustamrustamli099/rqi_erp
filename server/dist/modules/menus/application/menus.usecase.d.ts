import { PrismaService } from '../../../prisma.service';
import { MenuItem } from '../../../platform/menu/menu.definition';
import { DecisionCenterService } from '../../../platform/decision/decision-center.service';
export declare class MenusUseCase {
    private readonly prisma;
    private readonly decisionCenter;
    constructor(prisma: PrismaService, decisionCenter: DecisionCenterService);
    getSidebar(user: any): Promise<MenuItem[]>;
    createDefaultMenu(): Promise<void>;
}
