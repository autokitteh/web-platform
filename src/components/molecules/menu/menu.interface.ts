export interface ISubmenuInfo {
	submenu: { name: string; href: string; id: number }[] | null;
	top: number;
}

export interface ISubmenu {
	submenuInfo: ISubmenuInfo;
}

export interface IMenu {
	className?: string;
	isOpen: boolean;
	onSubmenu?: (submenuInfo: ISubmenuInfo) => void;
}
