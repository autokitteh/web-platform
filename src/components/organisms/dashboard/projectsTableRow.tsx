import React, { MouseEvent, KeyboardEvent } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";

import { dateTimeFormat } from "@src/constants";
import { DeploymentStateVariant, SessionStateType } from "@src/enums";
import { SidebarHrefMenu } from "@src/enums/components";
import { DashboardProjectsTableRowProps } from "@src/interfaces/components";
import { cn, getSessionStateColor } from "@src/utilities";

import { IconButton, IconSvg, StatusBadge, Td, Tr } from "@components/atoms";

import { ActionStoppedIcon, ExportIcon, TrashIcon } from "@assets/image/icons";

export const DashboardProjectsTableRow = ({
	id,
	name,
	status,
	totalDeployments,
	running,
	stopped,
	completed,
	error,
	lastDeployed,
	deploymentId,
	handleDeactivateDeployment,
	downloadProjectExport,
	displayDeleteModal,
	navigate,
}: DashboardProjectsTableRowProps) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });

	const countStyle = (state?: SessionStateType, className?: string) =>
		cn(
			"max-w-12 truncate border-0 px-1 py-2 text-sm font-medium sm:max-w-12 2xl:max-w-16 3xl:max-w-24",
			"inline-flex h-7 min-w-12 items-center justify-center rounded-3xl hover:bg-gray-1100",
			getSessionStateColor(state),
			className
		);

	const handleOpenProjectFilteredSessions = (
		event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
		id: string,
		sessionState: keyof typeof SessionStateType
	) => {
		event.stopPropagation();
		navigate(`/${SidebarHrefMenu.projects}/${id}/sessions`, {
			state: { sessionState },
		});
	};

	const renderSessionCount = (count: number, type: SessionStateType, label: string) => (
		<div
			aria-label={t(`table.sessionTypes.${type}`)}
			className={countStyle(type)}
			onClick={(e) => handleOpenProjectFilteredSessions(e, id, type)}
			onKeyDown={(e) => handleOpenProjectFilteredSessions(e, id, type)}
			role="button"
			tabIndex={0}
			title={`${count} ${label}`}
		>
			{count}
		</div>
	);

	return (
		<Tr
			className="cursor-pointer pl-4 hover:bg-black"
			key={id}
			onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
		>
			<Td className="w-2/3 pr-4 hover:font-bold sm:w-1/5" title={name}>
				<div className="truncate">{name}</div>
			</Td>
			<Td className="hidden w-1/6 sm:flex">
				<div className="max-w-16 pr-4 md:max-w-28">
					<StatusBadge deploymentStatus={status} />
				</div>
			</Td>
			<Td className="hidden w-1/6 sm:flex" title={`${totalDeployments} ${t("table.columns.totalDeployments")}`}>
				<div className="w-full pr-6 text-center">{totalDeployments}</div>
			</Td>
			<Td className="-ml-1 hidden w-2/6 pr-2 sm:flex">
				{renderSessionCount(running, SessionStateType.running, t("table.sessionTypes.running"))}
				{renderSessionCount(stopped, SessionStateType.stopped, t("table.sessionTypes.stopped"))}
				{renderSessionCount(completed, SessionStateType.completed, t("table.sessionTypes.completed"))}
				{renderSessionCount(error, SessionStateType.error, t("table.sessionTypes.error"))}
			</Td>

			<Td className="hidden w-2/6 sm:flex">
				{lastDeployed ? moment(lastDeployed).local().format(dateTimeFormat) : t("never")}
			</Td>

			<Td className="w-1/3 sm:w-1/6">
				<div className="flex justify-end">
					{status === DeploymentStateVariant.active ? (
						<IconButton
							aria-label={t("buttons.stopDeployment")}
							className="group size-8 p-1"
							onClick={(event) => {
								event.stopPropagation();
								handleDeactivateDeployment(deploymentId);
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
							downloadProjectExport(id);
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
							displayDeleteModal(status, deploymentId, id, name);
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
			</Td>
		</Tr>
	);
};
