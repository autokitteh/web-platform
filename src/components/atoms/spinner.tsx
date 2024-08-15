import React from "react";

import { SpinnerProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Spinner = ({ className }: SpinnerProps) => {
	const baseStyle = cn("border-current h-5 w-5 animate-spin rounded-full border-2", className);

	return <div aria-label="loading" className={`border-e-transparent ${baseStyle}`} role="status" />;
};
