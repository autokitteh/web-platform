import React, { FunctionComponent, LazyExoticComponent, SVGProps } from "react";

export interface NavigationButtonProps {
	ariaLabel: string;
	icon:
		| React.ComponentType<SVGProps<SVGSVGElement>>
		| LazyExoticComponent<FunctionComponent<SVGProps<SVGSVGElement>>>;
	id?: string;
	isEventsButton?: boolean;
	isSelected: boolean;
	keyName: string;
	label: string;
	disabled?: boolean;
	onClick: () => void;
	showUnderline?: boolean;
	hasActiveIndicator?: boolean;
	customIconClassName?: string;
}
