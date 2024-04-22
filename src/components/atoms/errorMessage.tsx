import React from "react";
import { ErrorMessageProps } from "@interfaces/components";
import { cn } from "@utilities";

export const ErrorMessage = ({ children, className }: ErrorMessageProps) => {
	const baseStyle = cn("absolute text-error", className);

	return children && <p className={baseStyle}>{children}</p>;
};
