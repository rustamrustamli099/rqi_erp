import { IdentityUseCase } from '../application/identity.usecase';
export declare class UsersController {
    private readonly identityUseCase;
    constructor(identityUseCase: IdentityUseCase);
    getUsers(req: any): Promise<import("../domain/user.entity").User[]>;
}
