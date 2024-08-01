import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const TBody = ({ children, className, variant }: TableProps) => (
	<tbody className={cn("bg-gray-1100", { "bg-gray-250 text-gray-1150": variant === "light" }, className)}>
		{children}
	</tbody>
);
