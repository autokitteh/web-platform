import { CSSProperties, Ref } from "react";

import { Placement } from "@floating-ui/react";

export interface PopoverOptions {
	initialOpen?: boolean;
	placement?: Placement;
	modal?: boolean;
	open?: boolean;
	interactionType: "click" | "hover";
	onOpenChange?: (open: boolean) => void;
	animation?: "slideFromLeft" | "slideFromBottom";
}

export interface PopoverTriggerProps {
	children: React.ReactNode;
	asChild?: boolean;
	onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface PopoverListItem {
	id: string;
	label: string | React.ReactNode;
	itemClassName?: string;
}

export interface PopoverListOptions extends PopoverOptions {
	items: PopoverListItem[];
	onItemSelect?: (item: PopoverListItem) => void;
}

export interface PopoverContentBaseProps {
	[key: string]: any;
	context: any;
	floatingContext: any;
	style?: CSSProperties;
	skipInitialFocus?: boolean;
	initialFocusElement?: Ref<any>;
}
