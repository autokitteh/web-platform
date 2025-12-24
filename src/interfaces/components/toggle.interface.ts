import { ReactNode } from "react";

export interface ToggleProps {
	checked: boolean;
	title?: string;
	label?: string;
	labelClass?: string;
	labelPosition?: "left" | "right";
	size?: "sm" | "md";
	onChange: (checked: boolean) => void;
	description?: string | ReactNode;
	className?: string;
}
