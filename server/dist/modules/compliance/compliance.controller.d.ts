import { EvidenceService } from './evidence.service';
import type { Response } from 'express';
export declare class ComplianceController {
    private evidenceService;
    constructor(evidenceService: EvidenceService);
    exportEvidence(type: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
