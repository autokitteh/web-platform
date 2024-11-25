import { Placement } from "@floating-ui/react";

export interface PopoverOptions {
	initialOpen?: boolean;
	placement?: Placement;
	modal?: boolean;
	open?: boolean;
	interactionType?: "click" | "hover";
	onOpenChange?: (open: boolean) => void;
	animation?: "none" | "slideFromLeft" | "slideFromBottom";
}

export interface PopoverTriggerProps {
	children: React.ReactNode;
	asChild?: boolean;
}

export interface PopoverListItem {
	id: string;
	label: string;
	value: any;
}

export interface PopoverListOptions extends PopoverOptions {
	items: PopoverListItem[];
	onItemSelect?: (item: PopoverListItem) => void;
}
