import { ReactNode } from "react";

import { ColorSchemes } from "@src/types";

export interface DrawerProps {
	children: ReactNode;
	name: string;
	variant?: ColorSchemes;
	className?: string;
	forcedOpen?: boolean;
	wrapperClassName?: string;
}
