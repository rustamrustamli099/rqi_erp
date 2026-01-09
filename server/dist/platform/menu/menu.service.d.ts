import { MenuItem } from './menu.definition';
import { DecisionCenterService } from '../decision/decision-center.service';
export declare class MenuService {
    private readonly decisionCenter;
    constructor(decisionCenter: DecisionCenterService);
    filterMenu(menuItems: MenuItem[], permissions: string[]): MenuItem[];
}
