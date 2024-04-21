import React from "react";
import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Table = ({ className, children }: TableProps) => {
	const tableStyle = cn("overflow-y-auto rounded-md border border-gray-600 scrollbar", className);

	return (
		<div className={tableStyle}>
			<table className="min-w-full">{children}</table>
		</div>
	);
};
