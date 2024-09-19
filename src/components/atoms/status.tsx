import React from "react";

import { StatusProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Status = ({ children, className }: StatusProps) => {
	const statusClasses = cn(
		"rounded border border-gray-450 bg-gray-400 px-1.5 py-1 text-xs font-bold text-gray-900",
		className
	);

	return <div className={statusClasses}>{children}</div>;
};
