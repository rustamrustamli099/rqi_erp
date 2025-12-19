
export type FileType = "folder" | "image" | "pdf" | "doc" | "sheet" | "video" | "unknown";

export interface FilePermission {
    subjectId: string; // User ID or Role ID
    subjectType: "user" | "role" | "group";
    subjectName: string;
    canView: boolean;
    canUpload: boolean;
    canDelete: boolean;
    canRename: boolean;
    canApprove: boolean;
    inherited: boolean;
}

export interface FileVersion {
    id: string;
    version: number;
    size: string;
    modifiedBy: string;
    modifiedAt: string;
    comment: string;
}

export interface FileItem {
    id: string;
    parentId: string | null;
    name: string;
    type: FileType;
    size?: string;
    modifiedAt: string;
    modifiedBy: string;
    isSensitive: boolean;
    approvalStatus?: "APPROVED" | "PENDING" | "REJECTED" | "NONE";
    locked?: boolean;
    tags?: string[];
}
