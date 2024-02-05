import React from "react";
import { cn } from "@utils";

interface ITable {
	className?: string;
	children: React.ReactNode;
}

export const Table = ({ className, children }: ITable) => {
	const tableStyle = cn("overflow-y-auto rounded-md border border-gray-600 scrollbar-table", className);

	return (
		<div className={tableStyle} role="table">
			{children}
		</div>
	);
};
