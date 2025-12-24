import React from "react";

import { CellContext } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { dateTimeFormat } from "@constants";
import { ProjectsTableMeta } from "@interfaces/components";
import { DashboardProjectWithStats } from "@type/models";

import { SkeletonLoader } from "@components/organisms/configuration/shared";

export const LastDeployedCell = ({ row, table }: CellContext<DashboardProjectWithStats, unknown>) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { id, lastDeployed } = row.original;
	const meta = table.options.meta as ProjectsTableMeta;

	if (meta?.isLoadingStats(id)) {
		return <SkeletonLoader className="h-5" />;
	}

	if (meta?.hasLoadError(id)) {
		return <span className="text-gray-500">-</span>;
	}

	if (!lastDeployed) {
		return <span>{t("never")}</span>;
	}

	return <span>{dayjs(lastDeployed).format(dateTimeFormat)}</span>;
};
