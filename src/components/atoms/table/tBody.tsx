import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

import { useTableVariant } from "@components/atoms/table";

export const TBody = ({ children, className }: TableProps) => {
	const { variant } = useTableVariant();

	return (
		<div
			className={cn("bg-gray-1100", { "bg-gray-250 text-gray-1150": variant === "light" }, className)}
			role="rowgroup"
		>
			{children}
		</div>
	);
};
