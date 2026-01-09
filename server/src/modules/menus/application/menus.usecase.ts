import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ADMIN_MENU_TREE, MenuItem } from '../../../platform/menu/menu.definition';
import { DecisionCenterService } from '../../../platform/decision/decision-center.service';

@Injectable()
export class MenusUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly decisionCenter: DecisionCenterService
    ) { }

    async getSidebar(user: any) {
        // Source of Truth: Code (ADMIN_MENU_TREE)
        // Filtering: Decision Center (Single Source of Truth)

        const userPermissions = (user.permissions as string[]) || [];

        return this.decisionCenter.resolveNavigationTree(ADMIN_MENU_TREE, userPermissions);
    }

    async createDefaultMenu() {
        // [DEPRECATED] DB Menu Seeding disabled.
        return;
    }
}
