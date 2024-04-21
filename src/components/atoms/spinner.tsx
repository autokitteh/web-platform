import React from "react";
import { SpinnerProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Spinner = ({ className }: SpinnerProps) => {
	const baseStyle = cn("h-5 w-5 animate-spin rounded-full border-2 border-current", className);

	return <div aria-label="loading" className={`border-e-transparent ${baseStyle} `} role="status" />;
};
