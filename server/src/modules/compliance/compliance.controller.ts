import { Controller, Get, UseGuards, Param, Res, NotFoundException } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../platform/auth/permissions.guard';
import type { Response } from 'express';

@Controller('compliance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ComplianceController {
    constructor(private evidenceService: EvidenceService) { }

    @Get('export/:type')
    async exportEvidence(@Param('type') type: string, @Res() res: Response) {
        let data;

        if (type === 'soc2') {
            data = await this.evidenceService.generateSoc2Evidence();
        } else if (type === 'iso27001') {
            data = await this.evidenceService.generateIsoSoa();
        } else {
            throw new NotFoundException('Unsupported evidence type');
        }

        res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${type}_evidence_${Date.now()}.json"`,
        });

        return res.json(data);
    }
}
