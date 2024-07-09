import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Table = ({ children, className }: TableProps) => {
	const tableStyle = cn("scrollbar overflow-y-auto rounded-t-14", className);

	return (
		<div className={tableStyle}>
			<table className="h-full min-w-full">{children}</table>
		</div>
	);
};
