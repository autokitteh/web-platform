import React from "react";
import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const TBody = ({ className, children }: TableProps) => {
	const bodyStyle = cn("border-t border-gray-600", className);

	return <tbody className={bodyStyle}>{children}</tbody>;
};
