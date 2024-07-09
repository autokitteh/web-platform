import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const THead = ({ children, className }: TableProps) => {
	const headStyle = cn("sticky top-0 z-10 overflow-hidden bg-gray-800 text-gray-300", className);

	return <thead className={headStyle}>{children}</thead>;
};
