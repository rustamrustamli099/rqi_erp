import { FilesUseCase } from '../application/files.usecase';
export declare class FilesController {
    private readonly filesUseCase;
    constructor(filesUseCase: FilesUseCase);
    uploadFile(file: Express.Multer.File, req: any): Promise<import("..").FileEntity>;
}
