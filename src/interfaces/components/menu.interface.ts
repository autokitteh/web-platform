export interface SubmenuInfo {
	submenu: { id: number | string; name: string; href?: string }[] | undefined;
	top: number;
}

export interface SubmenuProps {
	submenuInfo: SubmenuInfo;
}

export interface MenuProps {
	className?: string;
	isOpen: boolean;
	onSubmenu?: (submenuInfo: SubmenuInfo) => void;
}
