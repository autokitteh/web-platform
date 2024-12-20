import { FunctionComponent, SVGProps } from "react";

export interface MenuProps {
	className?: string;
	isOpen: boolean;
}

export interface NavigationSettingsItem {
	icon: FunctionComponent<SVGProps<SVGSVGElement>>;
	label: string;
	href: string;
	stroke?: boolean;
}
