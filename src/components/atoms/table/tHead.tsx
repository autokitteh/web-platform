import React from "react";
import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const THead = ({ className, children }: TableProps) => {
	const headStyle = cn("sticky z-10 top-0 bg-black text-gray-300 rounded-t", className);

	return <thead className={headStyle}>{children}</thead>;
};
