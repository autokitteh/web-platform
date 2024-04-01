import React from "react";
import { ISpinner } from "@interfaces/components";
import { cn } from "@utilities";

export const Spinner = ({ className }: ISpinner) => {
	const baseStyle = cn("h-5 w-5 animate-spin rounded-full border-2 border-current", className);

	return <div aria-label="loading" className={`border-e-transparent ${baseStyle} `} role="status" />;
};
