export interface ISubmenuInfo {
    submenu: any[] | null;
    top: number;
}

export interface ISubmenu {
    submenuInfo: ISubmenuInfo
}

export interface IMenu {
    className?: string;
    isOpen: boolean;
    onSubmenu?: (submenuInfo: ISubmenuInfo) => void;
}