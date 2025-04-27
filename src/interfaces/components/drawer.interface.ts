import { ReactNode } from "react";

import { ColorSchemes } from "@type";

export interface DrawerProps {
	children: ReactNode;
	name: string;
	variant?: ColorSchemes;
	className?: string;
	isForcedOpen?: boolean;
	wrapperClassName?: string;
	onCloseCallback?: () => void;
}
