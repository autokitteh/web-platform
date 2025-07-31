import { ReactNode } from "react";

import { ColorSchemes } from "@src/types";

export interface DrawerProps {
	children: ReactNode;
	name: string;
	variant?: ColorSchemes;
	className?: string;
	isForcedOpen?: boolean;
	wrapperClassName?: string;
	onCloseCallback?: () => void;
	bgTransparent?: boolean;
	bgClickable?: boolean;
	width?: number;
	divId?: string;
}
