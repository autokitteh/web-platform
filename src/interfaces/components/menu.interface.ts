export interface SubmenuInfo {
	submenu: { href?: string; id: number | string; name: string }[] | undefined;
	top: number;
}

export interface SubmenuProps {
	submenuInfo: SubmenuInfo;
}

export interface MenuProps {
	className?: string;
	isOpen: boolean;
	onMouseLeave: (event: React.MouseEvent) => void;
	onSubmenu?: (submenuInfo: SubmenuInfo) => void;
}
