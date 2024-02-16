import React from "react";
import { IErrorMessage } from "@interfaces/components";
import { cn } from "@utilities";

export const ErrorMessage = ({ children, className }: IErrorMessage) => {
	const baseStyle = cn("absolute text-error", className);

	return children && <p className={baseStyle}>{children}</p>;
};
