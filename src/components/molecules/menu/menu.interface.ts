export interface ISubmenuInfo {
    submenu: any[] | null;
    top: number;
}

export interface IMenu {
    className?: string;
    isOpen: boolean;
    onSubmenu?: (submenuInfo: ISubmenuInfo) => void;
}

export interface IMenuItem {
    icon?: string;
    name: string;
    iconClasses?: string;
    className?: string;
    badgeText?: string;
    isOpen: boolean;
    isActive?: boolean;
    isHoverEffect?: boolean;
}
