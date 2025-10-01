import { ReactNode } from "react";

export interface ToggleProps {
	checked: boolean;
	title?: string;
	label?: string;
	onChange: (checked: boolean) => void;
	description?: string | ReactNode;
	className?: string;
}
