
export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    path?: string;
    permission?: string;
    children?: MenuItem[];
    disabled?: boolean;
}
