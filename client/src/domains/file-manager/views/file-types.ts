export interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: string;
    modifiedAt?: string;
    owner?: string;
}

export interface FilePermission {
    subjectId: string;
    subjectType: "role" | "user";
    subjectName: string;
    canView: boolean;
    canUpload: boolean;
    canDelete: boolean;
    canRename: boolean;
    canApprove: boolean;
    inherited: boolean;
}
