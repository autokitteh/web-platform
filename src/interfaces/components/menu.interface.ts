export interface ISubmenuInfo {
	submenu: { id: number | string; name: string; href?: string }[] | undefined;
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

export interface IMenuItem {
	id: number;
	icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	name: string;
	href: string;
	submenu?: ISubmenuInfo["submenu"];
}
