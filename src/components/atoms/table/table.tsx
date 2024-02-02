import React from "react";

import { cn } from "@utils";

interface ITable {
	className?: string;
	children: React.ReactNode;
}

export const Table = ({ className, children }: ITable) => {
	const tableStyle = cn("rounded-md border border-gray-600 text-sm", className);

	return (
		<div role="table" className={tableStyle}>
			{children}
		</div>
	);
};
