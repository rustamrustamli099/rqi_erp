import { Controller, Get, Post, Body, Query, UseGuards, Param, Res, NotFoundException, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EvidenceService } from './evidence.service';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../platform/auth/permissions.guard';
import type { Response } from 'express';
import { PrismaService } from '../../prisma.service';

// Compliance Controls mapping
const COMPLIANCE_CONTROLS = [
    { id: 'SOC2-CC6.1', framework: 'SOC2', controlId: 'CC6.1', name: 'Logical Access Security' },
    { id: 'SOC2-CC6.2', framework: 'SOC2', controlId: 'CC6.2', name: 'User Access Reviews' },
    { id: 'SOC2-CC6.3', framework: 'SOC2', controlId: 'CC6.3', name: 'Role-Based Access' },
    { id: 'SOC2-CC8.1', framework: 'SOC2', controlId: 'CC8.1', name: 'Change Authorization' },
    { id: 'SOC2-CC7.2', framework: 'SOC2', controlId: 'CC7.2', name: 'Security Monitoring' },
    { id: 'ISO-A.9.2.1', framework: 'ISO27001', controlId: 'A.9.2.1', name: 'User Registration' },
    { id: 'ISO-A.9.2.2', framework: 'ISO27001', controlId: 'A.9.2.2', name: 'Privileged Access' },
    { id: 'ISO-A.12.4.1', framework: 'ISO27001', controlId: 'A.12.4.1', name: 'Event Logging' },
];

@ApiTags('Compliance')
@Controller('compliance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ComplianceController {
    constructor(
        private evidenceService: EvidenceService,
        private prisma: PrismaService
    ) { }

    @Get('export/:type')
    @ApiOperation({ summary: 'Export evidence by type' })
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

    @Get('controls')
    @ApiOperation({ summary: 'Get compliance controls by framework' })
    getControls(@Query('framework') framework?: string) {
        if (framework) {
            return COMPLIANCE_CONTROLS.filter(c => c.framework === framework);
        }
        return COMPLIANCE_CONTROLS;
    }

    @Get('frameworks')
    @ApiOperation({ summary: 'Get supported compliance frameworks' })
    getFrameworks() {
        return [
            { id: 'SOC2', name: 'SOC 2 Type II', controlCount: 5 },
            { id: 'ISO27001', name: 'ISO 27001:2022', controlCount: 3 },
            { id: 'PCI_DSS', name: 'PCI DSS 4.0', controlCount: 0, coming: true }
        ];
    }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get compliance dashboard statistics' })
    async getDashboard() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [auditEvents, pendingApprovals, activeRoles] = await Promise.all([
            this.prisma.auditLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            this.prisma.approvalRequest.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
            this.prisma.role.count({ where: { status: 'ACTIVE' } })
        ]);

        return {
            auditEvents,
            pendingApprovals,
            activeRoles,
            frameworkCoverage: {
                SOC2: COMPLIANCE_CONTROLS.filter(c => c.framework === 'SOC2').length,
                ISO27001: COMPLIANCE_CONTROLS.filter(c => c.framework === 'ISO27001').length
            }
        };
    }

    @Post('evidence-pack')
    @ApiOperation({ summary: 'Generate full evidence pack' })
    async generateEvidencePack(
        @Body() body: { framework: string; from: string; to: string },
        @Request() req,
        @Res() res: Response
    ) {
        const period = { from: new Date(body.from), to: new Date(body.to) };
        const controls = COMPLIANCE_CONTROLS.filter(c => c.framework === body.framework);

        // Log the export
        await this.prisma.auditLog.create({
            data: {
                action: 'COMPLIANCE_EVIDENCE_EXPORT',
                resource: body.framework,
                module: 'COMPLIANCE',
                userId: req.user?.id,
                details: { framework: body.framework, period, controlCount: controls.length }
            }
        });

        const evidence = body.framework === 'SOC2'
            ? await this.evidenceService.generateSoc2Evidence()
            : await this.evidenceService.generateIsoSoa();

        const pack = {
            generatedAt: new Date().toISOString(),
            framework: body.framework,
            period: { from: period.from.toISOString(), to: period.to.toISOString() },
            controls,
            evidence,
            metadata: { generatedBy: req.user?.email }
        };

        const filename = `evidence_pack_${body.framework}_${Date.now()}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(JSON.stringify(pack, null, 2));
    }
}
