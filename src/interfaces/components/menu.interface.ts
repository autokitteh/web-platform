import { MemberRole } from "@src/enums";
import { SvgIconType } from "@src/interfaces/components/icon.interface";

export interface MenuProps {
	className?: string;
	isOpen: boolean;
}

export interface NavigationSettingsItem {
	icon: SvgIconType;
	label: string;
	href: string;
	stroke?: boolean;
	allowedRoles?: MemberRole[];
}
