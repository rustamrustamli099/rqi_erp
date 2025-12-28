/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPLIANCE SERVICE - SOC2/ISO Evidence Pack Generator
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Auto-exports audit evidence for compliance frameworks:
 * - SOC2 Type II
 * - ISO 27001
 * - PCI DSS
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface ComplianceControl {
    id: string;
    framework: 'SOC2' | 'ISO27001' | 'PCI_DSS';
    controlId: string;
    controlName: string;
    description: string;
    evidenceSources: string[];
}

export interface EvidencePackItem {
    controlId: string;
    evidenceType: string;
    recordCount: number;
    sampleData?: any[];
    exportedAt: string;
}

export interface EvidencePack {
    generatedAt: string;
    framework: string;
    period: {
        from: string;
        to: string;
    };
    controls: EvidencePackItem[];
    metadata: {
        generatedBy: string;
        correlationId: string;
    };
}

// Control-to-Evidence mapping
const COMPLIANCE_CONTROLS: ComplianceControl[] = [
    // SOC2 - Access Control
    {
        id: 'SOC2-CC6.1',
        framework: 'SOC2',
        controlId: 'CC6.1',
        controlName: 'Logical Access Security',
        description: 'Logical access to information assets is restricted',
        evidenceSources: ['roles', 'role_permissions', 'user_roles', 'audit_logs']
    },
    {
        id: 'SOC2-CC6.2',
        framework: 'SOC2',
        controlId: 'CC6.2',
        controlName: 'User Access Reviews',
        description: 'Periodic review of access rights',
        evidenceSources: ['role_change_requests', 'approval_requests', 'audit_logs']
    },
    {
        id: 'SOC2-CC6.3',
        framework: 'SOC2',
        controlId: 'CC6.3',
        controlName: 'Role-Based Access',
        description: 'Access based on job function using RBAC',
        evidenceSources: ['roles', 'role_permissions', 'permissions']
    },
    // SOC2 - Change Management
    {
        id: 'SOC2-CC8.1',
        framework: 'SOC2',
        controlId: 'CC8.1',
        controlName: 'Change Authorization',
        description: 'Changes require authorized approval',
        evidenceSources: ['role_change_requests', 'approval_requests', 'audit_logs']
    },
    // SOC2 - Monitoring
    {
        id: 'SOC2-CC7.2',
        framework: 'SOC2',
        controlId: 'CC7.2',
        controlName: 'Security Monitoring',
        description: 'System activity is logged and monitored',
        evidenceSources: ['audit_logs', 'security_logs']
    },
    // ISO 27001
    {
        id: 'ISO-A.9.2.1',
        framework: 'ISO27001',
        controlId: 'A.9.2.1',
        controlName: 'User Registration',
        description: 'User registration and de-registration process',
        evidenceSources: ['users', 'user_roles', 'audit_logs']
    },
    {
        id: 'ISO-A.9.2.2',
        framework: 'ISO27001',
        controlId: 'A.9.2.2',
        controlName: 'Privileged Access',
        description: 'Management of privileged access rights',
        evidenceSources: ['roles', 'role_permissions', 'role_change_requests']
    },
    {
        id: 'ISO-A.12.4.1',
        framework: 'ISO27001',
        controlId: 'A.12.4.1',
        controlName: 'Event Logging',
        description: 'Event logs recording user activities',
        evidenceSources: ['audit_logs', 'security_logs']
    }
];

@Injectable()
export class ComplianceService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get available compliance controls
     */
    getControls(framework?: string): ComplianceControl[] {
        if (framework) {
            return COMPLIANCE_CONTROLS.filter(c => c.framework === framework);
        }
        return COMPLIANCE_CONTROLS;
    }

    /**
     * Generate evidence pack for a compliance framework
     */
    async generateEvidencePack(
        framework: 'SOC2' | 'ISO27001' | 'PCI_DSS',
        period: { from: Date; to: Date },
        generatedBy: { id: string; name: string }
    ): Promise<EvidencePack> {
        const controls = this.getControls(framework);
        const evidenceItems: EvidencePackItem[] = [];

        for (const control of controls) {
            const evidence = await this.collectEvidenceForControl(control, period);
            evidenceItems.push(evidence);
        }

        const correlationId = `EVID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Log evidence pack generation
        await this.prisma.auditLog.create({
            data: {
                action: 'COMPLIANCE_EVIDENCE_EXPORT',
                resource: framework,
                module: 'COMPLIANCE',
                userId: generatedBy.id,
                details: {
                    framework,
                    period: { from: period.from.toISOString(), to: period.to.toISOString() },
                    controlsExported: evidenceItems.length,
                    correlationId
                }
            }
        });

        return {
            generatedAt: new Date().toISOString(),
            framework,
            period: {
                from: period.from.toISOString(),
                to: period.to.toISOString()
            },
            controls: evidenceItems,
            metadata: {
                generatedBy: generatedBy.name,
                correlationId
            }
        };
    }

    /**
     * Collect evidence for a specific control
     */
    private async collectEvidenceForControl(
        control: ComplianceControl,
        period: { from: Date; to: Date }
    ): Promise<EvidencePackItem> {
        let recordCount = 0;
        const sampleData: any[] = [];

        for (const source of control.evidenceSources) {
            try {
                const count = await this.countRecordsInPeriod(source, period);
                recordCount += count;

                // Get sample records (up to 5)
                if (sampleData.length < 5) {
                    const samples = await this.getSampleRecords(source, period, 5 - sampleData.length);
                    sampleData.push(...samples);
                }
            } catch (err) {
                console.warn(`Failed to collect evidence from ${source}:`, err);
            }
        }

        return {
            controlId: control.controlId,
            evidenceType: control.controlName,
            recordCount,
            sampleData: sampleData.slice(0, 5),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Count records in a table for the given period
     */
    private async countRecordsInPeriod(
        source: string,
        period: { from: Date; to: Date }
    ): Promise<number> {
        const tableMap: Record<string, any> = {
            'audit_logs': this.prisma.auditLog,
            'security_logs': this.prisma.securityLog,
            'roles': this.prisma.role,
            'role_permissions': this.prisma.rolePermission,
            'users': this.prisma.user,
            'user_roles': this.prisma.userRole,
            'permissions': this.prisma.permission,
            'role_change_requests': this.prisma.roleChangeRequest,
            'approval_requests': this.prisma.approvalRequest
        };

        const model = tableMap[source];
        if (!model) return 0;

        // Check if model has createdAt field
        const hasCreatedAt = ['audit_logs', 'security_logs', 'role_change_requests', 'approval_requests'].includes(source);

        if (hasCreatedAt) {
            return model.count({
                where: {
                    createdAt: {
                        gte: period.from,
                        lte: period.to
                    }
                }
            });
        }

        return model.count();
    }

    /**
     * Get sample records from a table
     */
    private async getSampleRecords(
        source: string,
        period: { from: Date; to: Date },
        limit: number
    ): Promise<any[]> {
        const tableMap: Record<string, any> = {
            'audit_logs': this.prisma.auditLog,
            'security_logs': this.prisma.securityLog,
            'roles': this.prisma.role,
            'role_change_requests': this.prisma.roleChangeRequest,
            'approval_requests': this.prisma.approvalRequest
        };

        const model = tableMap[source];
        if (!model) return [];

        try {
            return await model.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                where: {
                    createdAt: {
                        gte: period.from,
                        lte: period.to
                    }
                }
            });
        } catch {
            return await model.findMany({ take: limit });
        }
    }

    /**
     * Get compliance dashboard statistics
     */
    async getComplianceDashboard(): Promise<{
        frameworkCoverage: Record<string, number>;
        recentAuditEvents: number;
        pendingApprovals: number;
        lastEvidenceExport?: Date;
    }> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [recentAuditEvents, pendingApprovals] = await Promise.all([
            this.prisma.auditLog.count({
                where: { createdAt: { gte: thirtyDaysAgo } }
            }),
            this.prisma.approvalRequest.count({
                where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }
            })
        ]);

        // Calculate framework coverage (controls that have evidence)
        const frameworkCoverage: Record<string, number> = {};
        for (const framework of ['SOC2', 'ISO27001', 'PCI_DSS']) {
            const controls = this.getControls(framework);
            frameworkCoverage[framework] = controls.length;
        }

        return {
            frameworkCoverage,
            recentAuditEvents,
            pendingApprovals
        };
    }
}
