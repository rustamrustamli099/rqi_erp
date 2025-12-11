import { Controller, Post, Get, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
    constructor(private filesService: FilesService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
        return this.filesService.uploadFile(file, req.user.id);
    }
    @Get()
    async findAll() {
        return this.filesService.findAll();
    }
}
