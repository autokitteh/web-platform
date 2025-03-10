import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

import { useTableVariant } from "@components/atoms/table";

export const THead = ({ children, className }: TableProps) => {
	const { variant } = useTableVariant();
	const headStyle = cn(
		"sticky top-0 z-10 overflow-hidden rounded-t-lg bg-gray-1250 text-gray-500",
		{
			"bg-white text-gray-1250": variant === "light",
		},
		className
	);

	return (
		<div className={headStyle} role="rowgroup">
			{children}
		</div>
	);
};
