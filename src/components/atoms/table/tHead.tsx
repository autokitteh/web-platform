import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const THead = ({ children, className }: TableProps) => {
	const headStyle = cn("sticky z-10 top-0 bg-gray-800 text-gray-300 overflow-hidden", className);

	return <thead className={headStyle}>{children}</thead>;
};
