import React from "react";
import { ErrorMessageProps } from "@interfaces/components";
import { cn } from "@utilities";

export const ErrorMessage = ({ children, className, ariaLabel }: ErrorMessageProps) => {
	const baseStyle = cn("absolute text-error", className);

	return (
		children && (
			<p aria-label={ariaLabel} className={baseStyle} role="alert">
				{children}
			</p>
		)
	);
};
