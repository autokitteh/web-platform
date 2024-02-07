import React from "react";
import { ITable } from "@interfaces/components";
import { cn } from "@utilities";

export const Table = ({ className, children }: ITable) => {
	const tableStyle = cn("overflow-y-auto rounded-md border border-gray-600 scrollbar", className);

	return (
		<div className={tableStyle} role="table">
			{children}
		</div>
	);
};
