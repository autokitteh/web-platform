import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const THead = ({ children, className }: TableProps) => {
	const headStyle = cn("sticky top-0 z-10 overflow-hidden bg-gray-1250 text-gray-500", className);

	return <thead className={headStyle}>{children}</thead>;
};
