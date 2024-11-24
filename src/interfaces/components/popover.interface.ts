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
