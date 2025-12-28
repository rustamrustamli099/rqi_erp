/**
 * Export Controller - Enterprise Grade Export API
 */
import { Controller, Post, Get, Param, Body, Query, UseGuards, Request, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { ExportJobService } from './export-job.service';
import type { Response } from 'express';

@ApiTags('Export')
@Controller('exports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
    constructor(private readonly exportJobService: ExportJobService) { }

    @Post()
    @ApiOperation({ summary: 'Create export job' })
    async createExportJob(
        @Body() body: {
            datasetKey: string;
            filterSnapshot?: any;
            columns: any[];
        },
        @Request() req
    ) {
        const result = await this.exportJobService.createExportJob({
            datasetKey: body.datasetKey,
            filterSnapshot: body.filterSnapshot,
            columns: body.columns,
            requestedByUserId: req.user.id,
            requestedByName: req.user.fullName || req.user.email
        });

        return result;
    }

    @Get(':id/status')
    @ApiOperation({ summary: 'Get export job status' })
    async getJobStatus(@Param('id') id: string) {
        return this.exportJobService.getJobStatus(id);
    }

    @Get('my-jobs')
    @ApiOperation({ summary: 'Get user export jobs' })
    async getMyJobs(@Request() req, @Query('limit') limit?: string) {
        return this.exportJobService.getUserExportJobs(req.user.id, limit ? parseInt(limit) : 20);
    }

    @Get(':id/download')
    @ApiOperation({ summary: 'Download export file' })
    async downloadExport(@Param('id') id: string, @Request() req, @Res() res: Response) {
        const job = await this.exportJobService.getJobStatus(id);

        if (!job) throw new NotFoundException('Export job not found');
        if (job.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Export not ready' });
        }

        // In production, stream from S3
        // For now, return placeholder
        res.setHeader('Content-Type', job.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${job.fileName}"`);
        res.send(Buffer.from('XLSX data would be here'));
    }
}
