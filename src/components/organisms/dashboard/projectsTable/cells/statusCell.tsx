import React from "react";

import { CellContext } from "@tanstack/react-table";

import { ProjectsTableMeta } from "../types";
import { DashboardProjectWithStats } from "@type/models";

import { StatusBadge } from "@components/atoms";
import { SkeletonLoader } from "@components/organisms/configuration/shared";

export const StatusCell = ({ row, table }: CellContext<DashboardProjectWithStats, unknown>) => {
	const { status } = row.original;
	const meta = table.options.meta as ProjectsTableMeta;

	if (meta?.isLoadingStats) {
		return <SkeletonLoader className="mb-0.5 h-5 w-16" />;
	}

	return (
		<div className="max-w-16 pr-4 md:max-w-28">
			<StatusBadge deploymentStatus={status} />
		</div>
	);
};
