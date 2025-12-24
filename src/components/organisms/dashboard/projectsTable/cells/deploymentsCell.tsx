import React from "react";

import { CellContext } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { ProjectsTableMeta } from "@interfaces/components";
import { DashboardProjectWithStats } from "@type/models";

import { SkeletonLoader } from "@components/organisms/configuration/shared";

export const DeploymentsCell = ({ row, table }: CellContext<DashboardProjectWithStats, unknown>) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { id, totalDeployments } = row.original;
	const meta = table.options.meta as ProjectsTableMeta;

	if (meta?.isLoadingStats(id)) {
		return <SkeletonLoader className="h-5" />;
	}

	if (meta?.hasLoadError(id)) {
		return <span className="text-gray-500">-</span>;
	}

	return (
		<div className="w-full pr-6 text-center" title={`${totalDeployments} ${t("table.columns.totalDeployments")}`}>
			{totalDeployments}
		</div>
	);
};
