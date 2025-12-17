import React from "react";

import { CellContext } from "@tanstack/react-table";

import { DashboardProjectWithStats } from "@type/models";

export const NameCell = ({ row }: CellContext<DashboardProjectWithStats, unknown>) => {
	const { name } = row.original;

	return (
		<div className="truncate pr-4 hover:font-bold" title={name}>
			{name}
		</div>
	);
};
