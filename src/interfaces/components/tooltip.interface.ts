import { Placement } from "@floating-ui/react";

export interface TooltipProps {
	content?: string;
	children: React.ReactNode;
	variant?: "default" | "error";
	position?: Placement;
	disabled?: boolean;
}
