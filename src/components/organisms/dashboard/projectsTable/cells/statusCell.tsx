import React from "react";

import { CellContext } from "@tanstack/react-table";

import { ProjectsTableMeta } from "@interfaces/components";
import { DashboardProjectWithStats } from "@type/models";

import { StatusBadge } from "@components/atoms";
import { SkeletonLoader } from "@components/organisms/configuration/shared";

export const StatusCell = ({ row, table }: CellContext<DashboardProjectWithStats, unknown>) => {
	const { id, status } = row.original;
	const meta = table.options.meta as ProjectsTableMeta;

	if (meta?.isLoadingStats(id)) {
		return <SkeletonLoader className="h-5" />;
	}

	if (meta?.hasLoadError(id)) {
		return <span className="text-gray-500">-</span>;
	}

	return (
		<div className="max-w-16 pr-4 md:max-w-28">
			<StatusBadge deploymentStatus={status} />
		</div>
	);
};
