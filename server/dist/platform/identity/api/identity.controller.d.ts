import { IdentityUseCase } from '../application/identity.usecase';
export declare class IdentityController {
    private readonly identityUseCase;
    constructor(identityUseCase: IdentityUseCase);
    getUserByEmail(email: string): Promise<import("../domain/user.entity").User | null>;
}
