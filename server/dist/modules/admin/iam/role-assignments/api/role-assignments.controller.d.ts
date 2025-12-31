import { RoleAssignmentsService } from '../application/role-assignments.service';
import { AssignRoleDto } from './dto/assign-role.dto';
export declare class RoleAssignmentsController {
    private readonly service;
    constructor(service: RoleAssignmentsService);
    assign(dto: AssignRoleDto, req: any): Promise<any>;
    revoke(userId: string, roleId: string, scopeType: string, scopeId: string | undefined, req: any): Promise<{
        success: boolean;
    }>;
    listByUser(userId: string, scopeType: string, scopeId: string | undefined, req: any): Promise<any>;
}
