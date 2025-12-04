import { ReactNode } from "react";

import { DrawerName } from "@src/enums/components";
import { ColorSchemes } from "@src/types";

export interface DrawerProps {
	children: ReactNode;
	name: DrawerName;
	variant?: ColorSchemes;
	className?: string;
	isForcedOpen?: boolean;
	wrapperClassName?: string;
	onCloseCallback?: () => void;
	bgTransparent?: boolean;
	bgClickable?: boolean;
	width?: number;
	divId?: string;
	isScreenHeight?: boolean;
	position?: "left" | "right";
}
