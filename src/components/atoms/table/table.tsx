import React from "react";
import { ITable } from "@interfaces";
import { cn } from "@utilities";

export const Table = ({ className, children }: ITable) => {
	const tableStyle = cn("overflow-y-auto rounded-md border border-gray-600 scrollbar-table", className);

	return (
		<div className={tableStyle} role="table">
			{children}
		</div>
	);
};
