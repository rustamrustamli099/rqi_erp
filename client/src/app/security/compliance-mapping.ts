/**
 * Compliance Mapping Engine
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Automatic mapping of system controls to SOC2 and ISO 27001 frameworks.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE FRAMEWORKS
// ═══════════════════════════════════════════════════════════════════════════

export type ComplianceFramework = 'SOC2' | 'ISO27001';

export interface ComplianceControl {
    id: string;
    framework: ComplianceFramework;
    code: string;
    name: string;
    nameAz: string;
    description: string;
    category: string;
}

export interface SystemControl {
    id: string;
    name: string;
    nameAz: string;
    description: string;
    evidenceSource: string;
    features: string[];
    complianceMappings: ComplianceMapping[];
}

export interface ComplianceMapping {
    controlId: string;
    framework: ComplianceFramework;
    code: string;
    coverage: 'FULL' | 'PARTIAL' | 'MANUAL';
}

export interface ComplianceEvidence {
    id: string;
    controlId: string;
    type: 'SCREENSHOT' | 'LOG' | 'CONFIG' | 'POLICY' | 'AUDIT_TRAIL';
    title: string;
    description: string;
    timestamp: string;
    generatedBy: 'SYSTEM' | 'MANUAL';
    data?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SOC2 CONTROLS
// ═══════════════════════════════════════════════════════════════════════════

export const SOC2_CONTROLS: ComplianceControl[] = [
    // CC6 - Logical and Physical Access Controls
    {
        id: 'SOC2-CC6.1',
        framework: 'SOC2',
        code: 'CC6.1',
        name: 'Logical Access Security Software',
        nameAz: 'Məntiqi Giriş Təhlükəsizliyi',
        description: 'The entity implements logical access security software',
        category: 'Logical Access'
    },
    {
        id: 'SOC2-CC6.2',
        framework: 'SOC2',
        code: 'CC6.2',
        name: 'Access Authorization and Removal',
        nameAz: 'Giriş İcazəsi və Ləğvi',
        description: 'Prior to issuing system credentials, the entity registers authorized users',
        category: 'Logical Access'
    },
    {
        id: 'SOC2-CC6.3',
        framework: 'SOC2',
        code: 'CC6.3',
        name: 'Segregation of Duties',
        nameAz: 'Vəzifələrin Ayrılması',
        description: 'The entity authorizes, modifies, or removes access based on roles',
        category: 'Logical Access'
    },
    // CC7 - System Operations
    {
        id: 'SOC2-CC7.2',
        framework: 'SOC2',
        code: 'CC7.2',
        name: 'System Monitoring',
        nameAz: 'Sistem Monitorinqi',
        description: 'The entity monitors system components and detects anomalies',
        category: 'System Operations'
    },
    // CC8 - Change Management
    {
        id: 'SOC2-CC8.1',
        framework: 'SOC2',
        code: 'CC8.1',
        name: 'Change Authorization',
        nameAz: 'Dəyişiklik İcazəsi',
        description: 'The entity authorizes, documents, and controls changes',
        category: 'Change Management'
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// ISO 27001 CONTROLS
// ═══════════════════════════════════════════════════════════════════════════

export const ISO27001_CONTROLS: ComplianceControl[] = [
    // A.6 - Organization of Information Security
    {
        id: 'ISO-A.6.1.2',
        framework: 'ISO27001',
        code: 'A.6.1.2',
        name: 'Segregation of Duties',
        nameAz: 'Vəzifə Ayrılığı',
        description: 'Conflicting duties shall be segregated',
        category: 'Organization'
    },
    // A.9 - Access Control
    {
        id: 'ISO-A.9.1.2',
        framework: 'ISO27001',
        code: 'A.9.1.2',
        name: 'Access to Networks and Services',
        nameAz: 'Şəbəkə və Xidmətlərə Giriş',
        description: 'Users shall only be provided with access they are authorized for',
        category: 'Access Control'
    },
    {
        id: 'ISO-A.9.2.1',
        framework: 'ISO27001',
        code: 'A.9.2.1',
        name: 'User Registration and De-registration',
        nameAz: 'İstifadəçi Qeydiyyatı',
        description: 'Formal user registration and de-registration process',
        category: 'Access Control'
    },
    {
        id: 'ISO-A.9.2.2',
        framework: 'ISO27001',
        code: 'A.9.2.2',
        name: 'Privilege Management',
        nameAz: 'İmtiyaz İdarəetməsi',
        description: 'Allocation and use of privileged access rights restricted',
        category: 'Access Control'
    },
    {
        id: 'ISO-A.9.2.3',
        framework: 'ISO27001',
        code: 'A.9.2.3',
        name: 'Management of Secret Auth Info',
        nameAz: 'Gizli Məlumat İdarəetməsi',
        description: 'Allocation of secret authentication information controlled',
        category: 'Access Control'
    },
    {
        id: 'ISO-A.9.4.1',
        framework: 'ISO27001',
        code: 'A.9.4.1',
        name: 'Information Access Restriction',
        nameAz: 'Məlumat Girişi Məhdudiyyəti',
        description: 'Access to information and functions restricted in accordance with policy',
        category: 'Access Control'
    },
    // A.12 - Operations Security
    {
        id: 'ISO-A.12.4.1',
        framework: 'ISO27001',
        code: 'A.12.4.1',
        name: 'Event Logging',
        nameAz: 'Hadisə Jurnalı',
        description: 'Event logs recording user activities shall be produced',
        category: 'Operations Security'
    },
    {
        id: 'ISO-A.12.4.2',
        framework: 'ISO27001',
        code: 'A.12.4.2',
        name: 'Protection of Log Information',
        nameAz: 'Jurnal Qoruması',
        description: 'Logging facilities and log information protected',
        category: 'Operations Security'
    },
    {
        id: 'ISO-A.12.4.3',
        framework: 'ISO27001',
        code: 'A.12.4.3',
        name: 'Administrator and Operator Logs',
        nameAz: 'Admin Jurnalları',
        description: 'System admin and operator activities logged and protected',
        category: 'Operations Security'
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM CONTROLS (Our Platform Features)
// ═══════════════════════════════════════════════════════════════════════════

export const SYSTEM_CONTROLS: SystemControl[] = [
    {
        id: 'CTRL-RBAC',
        name: 'Role-Based Access Control',
        nameAz: 'Rol Əsaslı Giriş Nəzarəti',
        description: 'Fine-grained permission management with roles',
        evidenceSource: 'roles.list, permissions.matrix',
        features: ['Permission Matrix', 'Role Management', 'User-Role Assignment'],
        complianceMappings: [
            { controlId: 'SOC2-CC6.1', framework: 'SOC2', code: 'CC6.1', coverage: 'FULL' },
            { controlId: 'SOC2-CC6.2', framework: 'SOC2', code: 'CC6.2', coverage: 'FULL' },
            { controlId: 'ISO-A.9.1.2', framework: 'ISO27001', code: 'A.9.1.2', coverage: 'FULL' },
            { controlId: 'ISO-A.9.2.2', framework: 'ISO27001', code: 'A.9.2.2', coverage: 'FULL' },
        ]
    },
    {
        id: 'CTRL-SOD',
        name: 'Segregation of Duties Engine',
        nameAz: 'Vəzifə Ayrılığı Mühərriki',
        description: 'Automatic detection and prevention of SoD conflicts',
        evidenceSource: 'sod-validation.log, conflict-reports',
        features: ['SoD Rules', 'Conflict Detection', 'Blocking Modal'],
        complianceMappings: [
            { controlId: 'SOC2-CC6.3', framework: 'SOC2', code: 'CC6.3', coverage: 'FULL' },
            { controlId: 'ISO-A.6.1.2', framework: 'ISO27001', code: 'A.6.1.2', coverage: 'FULL' },
        ]
    },
    {
        id: 'CTRL-APPROVAL',
        name: '4-Eyes Approval Workflow',
        nameAz: '4-Göz Təsdiq İş Axını',
        description: 'Mandatory approval for high-risk changes',
        evidenceSource: 'approvals.timeline, workflow.log',
        features: ['Approval Inbox', 'Rejection Reasons', 'Timeline'],
        complianceMappings: [
            { controlId: 'SOC2-CC8.1', framework: 'SOC2', code: 'CC8.1', coverage: 'FULL' },
            { controlId: 'ISO-A.9.4.1', framework: 'ISO27001', code: 'A.9.4.1', coverage: 'PARTIAL' },
        ]
    },
    {
        id: 'CTRL-AUDIT',
        name: 'Audit Trail Logging',
        nameAz: 'Audit İzi Jurnallaması',
        description: 'Comprehensive logging of all user actions',
        evidenceSource: 'audit.log, timeline.entries',
        features: ['Action Logging', 'Before/After Snapshots', 'User Attribution'],
        complianceMappings: [
            { controlId: 'SOC2-CC7.2', framework: 'SOC2', code: 'CC7.2', coverage: 'FULL' },
            { controlId: 'ISO-A.12.4.1', framework: 'ISO27001', code: 'A.12.4.1', coverage: 'FULL' },
            { controlId: 'ISO-A.12.4.2', framework: 'ISO27001', code: 'A.12.4.2', coverage: 'PARTIAL' },
            { controlId: 'ISO-A.12.4.3', framework: 'ISO27001', code: 'A.12.4.3', coverage: 'FULL' },
        ]
    },
    {
        id: 'CTRL-RISK',
        name: 'Risk Scoring Engine',
        nameAz: 'Risk Qiymətləndirmə Mühərriki',
        description: 'Automatic risk assessment for roles and actions',
        evidenceSource: 'risk-scores.log',
        features: ['Permission Weights', 'Risk Badges', 'Approval Triggers'],
        complianceMappings: [
            { controlId: 'SOC2-CC6.1', framework: 'SOC2', code: 'CC6.1', coverage: 'PARTIAL' },
        ]
    },
    {
        id: 'CTRL-EXPORT',
        name: 'Controlled Data Export',
        nameAz: 'Nəzarətli Data Export',
        description: 'Audited and controlled data export with approval',
        evidenceSource: 'export.audit.log',
        features: ['Export Modal', 'Column Selection', 'Risk Warnings'],
        complianceMappings: [
            { controlId: 'SOC2-CC8.1', framework: 'SOC2', code: 'CC8.1', coverage: 'PARTIAL' },
            { controlId: 'ISO-A.9.4.1', framework: 'ISO27001', code: 'A.9.4.1', coverage: 'PARTIAL' },
        ]
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE MAPPING SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class ComplianceMappingService {
    /**
     * Get all controls for a framework
     */
    static getFrameworkControls(framework: ComplianceFramework): ComplianceControl[] {
        return framework === 'SOC2' ? SOC2_CONTROLS : ISO27001_CONTROLS;
    }

    /**
     * Get system controls that map to a compliance control
     */
    static getSystemControlsForCompliance(complianceControlId: string): SystemControl[] {
        return SYSTEM_CONTROLS.filter(sc =>
            sc.complianceMappings.some(m => m.controlId === complianceControlId)
        );
    }

    /**
     * Get compliance coverage summary
     */
    static getCoverageSummary(framework: ComplianceFramework): {
        total: number;
        covered: number;
        partial: number;
        manual: number;
        percentage: number;
    } {
        const controls = this.getFrameworkControls(framework);
        let covered = 0;
        let partial = 0;
        let manual = 0;

        for (const control of controls) {
            const systemControls = this.getSystemControlsForCompliance(control.id);
            if (systemControls.length > 0) {
                const hasFull = systemControls.some(sc =>
                    sc.complianceMappings.some(m => m.controlId === control.id && m.coverage === 'FULL')
                );
                if (hasFull) {
                    covered++;
                } else {
                    partial++;
                }
            } else {
                manual++;
            }
        }

        const total = controls.length;
        const percentage = Math.round((covered / total) * 100);

        return { total, covered, partial, manual, percentage };
    }

    /**
     * Generate compliance mapping table
     */
    static generateMappingTable(): {
        systemControl: string;
        systemControlAz: string;
        soc2Codes: string[];
        isoCodes: string[];
        evidenceSource: string;
    }[] {
        return SYSTEM_CONTROLS.map(sc => ({
            systemControl: sc.name,
            systemControlAz: sc.nameAz,
            soc2Codes: sc.complianceMappings
                .filter(m => m.framework === 'SOC2')
                .map(m => m.code),
            isoCodes: sc.complianceMappings
                .filter(m => m.framework === 'ISO27001')
                .map(m => m.code),
            evidenceSource: sc.evidenceSource
        }));
    }
}

export default ComplianceMappingService;
