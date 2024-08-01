import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Table = ({ children, className, variant }: TableProps) => {
	const tableStyle = cn(
		"scrollbar overflow-y-auto rounded-t-14 text-white",
		{ "border border-gray-600": variant === "light" },
		className
	);

	return (
		<div className={tableStyle}>
			<table className="h-full min-w-full">{children}</table>
		</div>
	);
};
