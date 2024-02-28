import React from "react";
import { ITable } from "@interfaces/components";
import { cn } from "@utilities";

export const Tr = ({ className, children }: ITable) => {
	const tRStyle = cn("flex border-b border-gray-600 last:border-b-0 transition hover:bg-black", className);

	return <tr className={tRStyle}>{children}</tr>;
};
