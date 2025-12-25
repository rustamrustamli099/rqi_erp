import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from '../../../../../platform/auth/permission.service';
import { PreviewPermissionsDto } from './dto/preview-permissions.dto';
import { JwtAuthGuard } from '../../../../../platform/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../../platform/auth/permissions.guard';

@ApiTags('Admin / Permissions')
@Controller('admin/permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Get()
    @ApiOperation({ summary: 'List all system permissions' })
    async findAll() {
        // Return structured list
        return this.permissionsService.findAll();
    }

    @Post('preview')
    @ApiOperation({ summary: 'Preview effective permissions and visible menus for a set of roles' })
    @ApiResponse({ status: 200, description: 'Preview data calculated successfully.' })
    async preview(@Body() dto: PreviewPermissionsDto) {
        return this.permissionsService.previewPermissions(dto);
    }
}
