import React from "react";

import { CellContext } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { ProjectsTableMeta } from "../types";
import { dateTimeFormat } from "@constants";
import { DashboardProjectWithStats } from "@type/models";

import { SkeletonLoader } from "@components/organisms/configuration/shared";

export const LastDeployedCell = ({ row, table }: CellContext<DashboardProjectWithStats, unknown>) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { lastDeployed } = row.original;
	const meta = table.options.meta as ProjectsTableMeta;

	if (meta?.isLoadingStats) {
		return <SkeletonLoader className="mb-0.5 h-5 w-32" />;
	}

	if (!lastDeployed) {
		return <span>{t("never")}</span>;
	}

	return <span>{dayjs(lastDeployed).format(dateTimeFormat)}</span>;
};
