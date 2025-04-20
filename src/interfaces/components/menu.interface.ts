import { FunctionComponent, SVGProps } from "react";

import { MemberRole } from "@src/enums";

export interface MenuProps {
	className?: string;
	isOpen: boolean;
}

export interface NavigationSettingsItem {
	icon: FunctionComponent<SVGProps<SVGSVGElement>>;
	label: string;
	href: string;
	stroke?: boolean;
	allowedRoles?: MemberRole[];
}
