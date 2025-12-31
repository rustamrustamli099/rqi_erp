/**
 * Workflow Service Unit Tests
 * SAP-Grade Approval System Tests
 */

import { WorkflowService } from './workflow.service';
import { PrismaService } from '../../prisma.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

// Mock PrismaService
const mockPrisma = {
    approvalRequest: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn()
    },
    approvalDecision: {
        create: jest.fn(),
        findMany: jest.fn()
    },
    approvalStageExecution: {
        createMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn()
    },
    workflowDefinition: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    },
    workflowStage: {
        findMany: jest.fn(),
        deleteMany: jest.fn()
    },
    notification: {
        create: jest.fn()
    },
    notificationDelivery: {
        create: jest.fn()
    },
    role: {
        update: jest.fn()
    },
    rolePermission: {
        deleteMany: jest.fn(),
        createMany: jest.fn()
    },
    permission: {
        findMany: jest.fn()
    },
    auditLog: {
        findMany: jest.fn()
    }
};

describe('WorkflowService', () => {
    let service: WorkflowService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new WorkflowService(mockPrisma as unknown as PrismaService);
    });

    describe('4-Eyes Principle', () => {
        it('should reject approval from requester (self-approval)', async () => {
            const userId = 'user-123';
            mockPrisma.approvalRequest.findUnique.mockResolvedValue({
                id: 'req-1',
                requestedById: userId,
                status: 'PENDING',
                currentStage: 1,
                stageExecutions: []
            });

            await expect(service.processApprovalAction({
                requestId: 'req-1',
                actorId: userId,
                actorName: 'Test User',
                action: 'APPROVE'
            })).rejects.toThrow(ForbiddenException);
        });

        it('should allow approval from different user', async () => {
            mockPrisma.approvalRequest.findUnique.mockResolvedValue({
                id: 'req-1',
                requestedById: 'user-123',
                status: 'PENDING',
                currentStage: 1,
                workflow: { stages: [{ id: 's1', order: 1 }] },
                stageExecutions: [{
                    id: 'se-1',
                    stageId: 's1',
                    stageOrder: 1,
                    approvedCount: 0
                }]
            });
            mockPrisma.approvalStageExecution.update.mockResolvedValue({});
            mockPrisma.approvalRequest.update.mockResolvedValue({});

            await expect(service.processApprovalAction({
                requestId: 'req-1',
                actorId: 'user-456', // Different user
                actorName: 'Approver',
                action: 'APPROVE'
            })).resolves.not.toThrow();
        });
    });

    describe('Sequential Stage Transitions', () => {
        it('should advance to next stage after approval', async () => {
            mockPrisma.approvalRequest.findUnique.mockResolvedValue({
                id: 'req-1',
                requestedById: 'user-123',
                status: 'PENDING',
                currentStage: 1,
                workflow: {
                    stages: [
                        { id: 's1', order: 1, approvalType: 'SEQUENTIAL', requiredCount: 1 },
                        { id: 's2', order: 2, approvalType: 'SEQUENTIAL', requiredCount: 1 }
                    ]
                },
                stageExecutions: [{
                    id: 'se-1',
                    stageId: 's1',
                    stageOrder: 1,
                    approvedCount: 0
                }]
            });
            mockPrisma.approvalStageExecution.update.mockResolvedValue({});
            mockPrisma.approvalRequest.update.mockResolvedValue({});
            mockPrisma.approvalStageExecution.updateMany.mockResolvedValue({});

            await service.processApprovalAction({
                requestId: 'req-1',
                actorId: 'user-456',
                actorName: 'Approver',
                action: 'APPROVE'
            });

            // Verify stage advancement
            expect(mockPrisma.approvalRequest.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ currentStage: 2 })
                })
            );
        });
    });

    describe('Parallel Approvals', () => {
        it('should require N approvals before advancing', async () => {
            mockPrisma.approvalRequest.findUnique.mockResolvedValue({
                id: 'req-1',
                requestedById: 'user-123',
                status: 'PENDING',
                currentStage: 1,
                workflow: {
                    stages: [
                        { id: 's1', order: 1, approvalType: 'PARALLEL', requiredCount: 2 }
                    ]
                },
                stageExecutions: [{
                    id: 'se-1',
                    stageId: 's1',
                    stageOrder: 1,
                    approvedCount: 0
                }]
            });
            mockPrisma.approvalStageExecution.update.mockResolvedValue({});
            mockPrisma.approvalRequest.update.mockResolvedValue({});

            await service.processApprovalAction({
                requestId: 'req-1',
                actorId: 'user-456',
                actorName: 'Approver 1',
                action: 'APPROVE'
            });

            // Stage should still be IN_PROGRESS (need 2 approvals)
            expect(mockPrisma.approvalStageExecution.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ status: 'IN_PROGRESS' })
                })
            );
        });
    });

    describe('Rejection', () => {
        it('should reject entire request on stage rejection', async () => {
            mockPrisma.approvalRequest.findUnique.mockResolvedValue({
                id: 'req-1',
                requestedById: 'user-123',
                status: 'PENDING',
                currentStage: 1,
                workflow: { stages: [{ id: 's1', order: 1 }] },
                stageExecutions: [{
                    id: 'se-1',
                    stageId: 's1',
                    stageOrder: 1,
                    approvedCount: 0
                }]
            });
            mockPrisma.approvalStageExecution.update.mockResolvedValue({});
            mockPrisma.approvalRequest.update.mockResolvedValue({});

            await service.processApprovalAction({
                requestId: 'req-1',
                actorId: 'user-456',
                actorName: 'Approver',
                action: 'REJECT',
                comment: 'Does not meet requirements'
            });

            expect(mockPrisma.approvalRequest.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ status: 'REJECTED' })
                })
            );
        });
    });

    describe('Cancellation', () => {
        it('should only allow requester to cancel', async () => {
            mockPrisma.approvalRequest.findUnique.mockResolvedValue({
                id: 'req-1',
                requestedById: 'user-123',
                status: 'PENDING'
            });

            await expect(service.cancelApprovalRequest({
                requestId: 'req-1',
                requesterId: 'user-456', // Different user
                reason: 'Changed my mind'
            })).rejects.toThrow(ForbiddenException);
        });

        it('should allow requester to cancel own request', async () => {
            mockPrisma.approvalRequest.findUnique.mockResolvedValue({
                id: 'req-1',
                requestedById: 'user-123',
                status: 'PENDING'
            });
            mockPrisma.approvalRequest.update.mockResolvedValue({});

            await expect(service.cancelApprovalRequest({
                requestId: 'req-1',
                requesterId: 'user-123',
                reason: 'Changed my mind'
            })).resolves.toEqual({ success: true, message: 'Request cancelled' });
        });
    });
});
