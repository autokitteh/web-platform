import React from "react";

import { StatusProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Status = ({ children, className, color = "gray" }: StatusProps) => {
	const statusClasses = cn(
		"rounded border px-1.5 py-1 text-xs font-bold",
		{
			"border-gray-450 bg-gray-400 text-gray-900": color === "gray",
		},
		className
	);

	return <div className={statusClasses}>{children}</div>;
};
