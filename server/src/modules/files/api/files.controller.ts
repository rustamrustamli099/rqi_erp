
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesUseCase } from '../application/files.usecase';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';

@Controller('files')
export class FilesController {
    constructor(private readonly filesUseCase: FilesUseCase) { }

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        return this.filesUseCase.uploadFile(file, req.user.userId);
    }
}
