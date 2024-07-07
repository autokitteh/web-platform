import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const Table = ({ children, className }: TableProps) => {
	const tableStyle = cn("overflow-y-auto rounded-t-14 scrollbar", className);

	return (
		<div className={tableStyle}>
			<table className="h-full min-w-full">{children}</table>
		</div>
	);
};
