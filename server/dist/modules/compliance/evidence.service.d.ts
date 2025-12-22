import { PrismaService } from '../../prisma.service';
export declare class EvidenceService {
    private prisma;
    constructor(prisma: PrismaService);
    generateSoc2Evidence(): Promise<{
        evidence_id: string;
        generated_at: string;
        scope: string;
        controls: {
            'CC6.1': {
                description: string;
                status: string;
                evidence: {
                    active_tenants: number;
                    tenant_sample: {
                        id: string;
                        name: string;
                        status: string;
                        type: import(".prisma/client").$Enums.TenantType;
                    }[];
                    roles_defined: {
                        name: string;
                        users: number;
                        scope: string;
                        approval_status: import(".prisma/client").$Enums.RoleStatus;
                    }[];
                };
            };
            'CC6.2': {
                description: string;
                status: string;
                evidence: {
                    role_approval_check: {
                        role: string;
                        compliant: boolean;
                        four_eyes_enforced: boolean;
                    }[];
                };
            };
            'CC6.6': {
                description: string;
                status: string;
                evidence: {
                    recent_logs: {
                        action: string;
                        actor: any;
                        time: Date;
                    }[];
                };
            };
        };
        integrity_hash: string;
    }>;
    generateIsoSoa(): Promise<{
        soa_id: string;
        generated_at: string;
        standard: string;
        controls: {
            id: string;
            name: string;
            applicable: boolean;
            status: string;
        }[];
    }>;
}
