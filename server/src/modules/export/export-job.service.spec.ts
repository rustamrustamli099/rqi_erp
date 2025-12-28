/**
 * Export Job Service Unit Tests
 * Enterprise Grade Export Tests
 */

import { ExportJobService } from './export-job.service';
import { PrismaService } from '../../prisma.service';

// Mock PrismaService
const mockPrisma = {
    exportJob: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn()
    },
    approvalRequest: {
        create: jest.fn()
    },
    auditLog: {
        create: jest.fn()
    },
    user: {
        findMany: jest.fn()
    },
    role: {
        findMany: jest.fn()
    },
    tenant: {
        findMany: jest.fn()
    }
};

describe('ExportJobService', () => {
    let service: ExportJobService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new ExportJobService(mockPrisma as unknown as PrismaService);
    });

    describe('Risk Level Calculation', () => {
        it('should mark USERS dataset as HIGH risk', async () => {
            mockPrisma.exportJob.create.mockResolvedValue({
                id: 'job-1',
                datasetKey: 'USERS',
                riskLevel: 'HIGH',
                requiresApproval: true
            });
            mockPrisma.approvalRequest.create.mockResolvedValue({ id: 'approval-1' });
            mockPrisma.exportJob.update.mockResolvedValue({});
            mockPrisma.auditLog.create.mockResolvedValue({});

            const result = await service.createExportJob({
                datasetKey: 'USERS',
                columns: [{ key: 'email', header: 'Email' }],
                requestedByUserId: 'user-123'
            });

            expect(result.requiresApproval).toBe(true);
            expect(mockPrisma.approvalRequest.create).toHaveBeenCalled();
        });

        it('should mark ROLES dataset as HIGH risk', async () => {
            mockPrisma.exportJob.create.mockResolvedValue({
                id: 'job-1',
                datasetKey: 'ROLES',
                riskLevel: 'HIGH',
                requiresApproval: true
            });
            mockPrisma.approvalRequest.create.mockResolvedValue({ id: 'approval-1' });
            mockPrisma.exportJob.update.mockResolvedValue({});
            mockPrisma.auditLog.create.mockResolvedValue({});

            const result = await service.createExportJob({
                datasetKey: 'ROLES',
                columns: [{ key: 'name', header: 'Role Name' }],
                requestedByUserId: 'user-123'
            });

            expect(result.requiresApproval).toBe(true);
        });

        it('should allow generic datasets without approval', async () => {
            mockPrisma.exportJob.create.mockResolvedValue({
                id: 'job-1',
                datasetKey: 'PRODUCTS',
                riskLevel: 'LOW',
                requiresApproval: false,
                status: 'QUEUED'
            });
            mockPrisma.auditLog.create.mockResolvedValue({});
            // Mock process to skip actual processing
            mockPrisma.exportJob.findUnique.mockResolvedValue({
                id: 'job-1',
                datasetKey: 'PRODUCTS'
            });

            const result = await service.createExportJob({
                datasetKey: 'PRODUCTS',
                filterSnapshot: { search: 'test' },
                columns: [{ key: 'name', header: 'Product' }],
                requestedByUserId: 'user-123'
            });

            expect(result.requiresApproval).toBe(false);
        });
    });

    describe('Filter Snapshot', () => {
        it('should respect filterSnapshot in export', async () => {
            const filterSnapshot = {
                search: 'admin',
                filters: { scope: 'SYSTEM' },
                sort: { field: 'name', direction: 'asc' }
            };

            mockPrisma.exportJob.create.mockResolvedValue({
                id: 'job-1',
                filterSnapshot,
                status: 'QUEUED'
            });
            mockPrisma.auditLog.create.mockResolvedValue({});

            await service.createExportJob({
                datasetKey: 'TENANTS',
                filterSnapshot,
                columns: [{ key: 'name', header: 'Tenant' }],
                requestedByUserId: 'user-123'
            });

            expect(mockPrisma.exportJob.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        filterSnapshot
                    })
                })
            );
        });
    });

    describe('Audit Logging', () => {
        it('should create audit log on export request', async () => {
            mockPrisma.exportJob.create.mockResolvedValue({
                id: 'job-1',
                datasetKey: 'APPROVALS'
            });
            mockPrisma.auditLog.create.mockResolvedValue({});

            await service.createExportJob({
                datasetKey: 'APPROVALS',
                columns: [{ key: 'id', header: 'ID' }],
                requestedByUserId: 'user-123'
            });

            expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        action: 'EXPORT_REQUESTED',
                        resource: 'APPROVALS',
                        module: 'EXPORT'
                    })
                })
            );
        });
    });
});
