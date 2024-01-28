export interface ISubmenuInfo {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	submenu: any[] | null;
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
