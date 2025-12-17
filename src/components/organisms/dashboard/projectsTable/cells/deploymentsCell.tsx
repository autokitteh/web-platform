import React from "react";

import { CellContext } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { ProjectsTableMeta } from "../types";
import { DashboardProjectWithStats } from "@type/models";

import { SkeletonLoader } from "@components/organisms/configuration/shared";

export const DeploymentsCell = ({ row, table }: CellContext<DashboardProjectWithStats, unknown>) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { totalDeployments } = row.original;
	const meta = table.options.meta as ProjectsTableMeta;

	if (meta?.isLoadingStats) {
		return <SkeletonLoader className="mb-0.5 h-5 w-8" />;
	}

	return (
		<div className="w-full pr-6 text-center" title={`${totalDeployments} ${t("table.columns.totalDeployments")}`}>
			{totalDeployments}
		</div>
	);
};
