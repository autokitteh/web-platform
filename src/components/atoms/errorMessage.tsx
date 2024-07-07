import { ErrorMessageProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const ErrorMessage = ({ ariaLabel, children, className }: ErrorMessageProps) => {
	const baseStyle = cn("absolute text-error", className);

	return (
		children && (
			<p aria-label={ariaLabel} className={baseStyle} role="alert">
				{children}
			</p>
		)
	);
};
