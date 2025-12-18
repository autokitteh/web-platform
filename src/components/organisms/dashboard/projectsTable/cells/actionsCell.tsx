import React from "react";

import { CellContext } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { DeploymentStateVariant } from "@enums";
import { ProjectsTableMeta } from "@interfaces/components";
import { DashboardProjectWithStats } from "@type/models";

import { IconButton, IconSvg } from "@components/atoms";

import { ActionStoppedIcon, ExportIcon, TrashIcon } from "@assets/image/icons";

export const ActionsCell = ({ row, table }: CellContext<DashboardProjectWithStats, unknown>) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { id, name, status, deploymentId } = row.original;
	const meta = table.options.meta as ProjectsTableMeta;

	if (meta?.isLoadingStats(id)) {
		return <div className="size-8 p-1" />;
	}

	return (
		<div className="flex justify-end">
			{status === DeploymentStateVariant.active ? (
				<IconButton
					aria-label={t("buttons.stopDeployment")}
					className="group size-8 p-1"
					onClick={(event) => {
						event.stopPropagation();
						meta?.onDeactivate?.(deploymentId);
					}}
					title={t("buttons.stopDeployment")}
				>
					<ActionStoppedIcon className="size-4 fill-white transition group-hover:fill-green-200 group-active:fill-green-800" />
				</IconButton>
			) : (
				<div className="size-8 p-1" />
			)}

			<IconButton
				aria-label={t("buttons.exportProject")}
				className="group"
				onClick={(event) => {
					event.stopPropagation();
					meta?.onExport?.(id);
				}}
				title={t("buttons.exportProject")}
			>
				<IconSvg
					className="stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
					size="md"
					src={ExportIcon}
				/>
			</IconButton>

			<IconButton
				aria-label={t("buttons.deleteProject")}
				className="group"
				onClick={(event) => {
					event.stopPropagation();
					meta?.onDelete?.(status, deploymentId, id, name);
				}}
				title={t("buttons.deleteProject")}
			>
				<IconSvg
					className="stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
					size="md"
					src={TrashIcon}
				/>
			</IconButton>
		</div>
	);
};
