import React, { MouseEvent, KeyboardEvent } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { dateTimeFormat } from "@src/constants";
import { DeploymentStateVariant, SessionStateType } from "@src/enums";
import { SidebarHrefMenu } from "@src/enums/components";
import { DashboardProjectWithStats } from "@src/types/models";
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
	handelDeactivateDeployment,
	downloadProjectExport,
	displayDeleteModal,
}: DashboardProjectWithStats & {
	displayDeleteModal: (
		status: DeploymentStateVariant,
		deploymentId: string,
		projectId: string,
		projectName: string
	) => void;
	downloadProjectExport: (projectId: string) => void;
	handelDeactivateDeployment: (deploymentId: string) => Promise<void>;
}) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const navigate = useNavigate();

	const countStyle = (state?: SessionStateType, className?: string) =>
		cn(
			"inline-block border-0 px-1 text-sm font-medium min-w-10 max-w-12 py-2 truncate sm:max-w-12 2xl:max-w-18 3xl:max-w-24",
			"hover:bg-gray-1100 rounded-3xl inline-flex justify-center items-center min-w-12 h-7",
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

	return (
		<Tr className="cursor-pointer pl-4 hover:bg-black" key={id}>
			<Td
				className="w-2/3 pr-4 hover:font-bold sm:w-1/5"
				onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
				title={name}
			>
				<div className="truncate">{name}</div>
			</Td>
			<Td className="hidden w-1/6 sm:flex" onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}>
				<div className="max-w-16 pr-4 md:max-w-28">
					<StatusBadge deploymentStatus={status} />
				</div>
			</Td>
			<Td
				className="hidden w-1/6 sm:flex"
				onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
				title={`${totalDeployments} ${t("table.columns.totalDeployments")}`}
			>
				<div className="w-full pr-6 text-center">{totalDeployments}</div>
			</Td>
			<Td
				className="-ml-1 hidden w-2/6 pr-2 sm:flex"
				onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
			>
				<div
					aria-label={t("table.sessionTypes.running")}
					className={countStyle(SessionStateType.running)}
					onClick={(event) => handleOpenProjectFilteredSessions(event, id, SessionStateType.running)}
					onKeyDown={(event) => {
						handleOpenProjectFilteredSessions(event, id, SessionStateType.running);
					}}
					role="button"
					tabIndex={0}
					title={`${running} ${t("table.sessionTypes.running")}`}
				>
					{running}
				</div>
				<div
					aria-label={t("table.sessionTypes.stopped")}
					className={countStyle(SessionStateType.stopped, "justify-center")}
					onClick={(event) => handleOpenProjectFilteredSessions(event, id, SessionStateType.stopped)}
					onKeyDown={(event) => handleOpenProjectFilteredSessions(event, id, SessionStateType.stopped)}
					role="button"
					tabIndex={0}
					title={`${stopped} ${t("table.sessionTypes.stopped")}`}
				>
					{stopped}
				</div>
				<div
					aria-label={t("table.sessionTypes.completed")}
					className={countStyle(SessionStateType.completed)}
					onClick={(event) => {
						handleOpenProjectFilteredSessions(event, id, SessionStateType.completed);
					}}
					onKeyDown={(event) => {
						handleOpenProjectFilteredSessions(event, id, SessionStateType.completed);
					}}
					role="button"
					tabIndex={0}
					title={`${completed} ${t("table.sessionTypes.completed")}`}
				>
					{completed}
				</div>
				<div
					aria-label={t("table.sessionTypes.error")}
					className={countStyle(SessionStateType.error)}
					onClick={(event) => {
						handleOpenProjectFilteredSessions(event, id, SessionStateType.error);
					}}
					onKeyDown={(event) => {
						handleOpenProjectFilteredSessions(event, id, SessionStateType.error);
					}}
					role="button"
					tabIndex={0}
					title={`${error} ${t("table.sessionTypes.error")}`}
				>
					{error}
				</div>
			</Td>

			<Td className="hidden w-2/6 sm:flex" onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}>
				{lastDeployed ? moment(lastDeployed).local().format(dateTimeFormat) : t("never")}
			</Td>

			<Td className="w-1/3 sm:w-1/6">
				<div className="flex justify-end">
					{status === DeploymentStateVariant.active ? (
						<IconButton
							aria-label={t("buttons.stopDeployment")}
							className="group size-8 p-1"
							onClick={() => handelDeactivateDeployment(deploymentId)}
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
						onClick={() => downloadProjectExport(id)}
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
						onClick={() => displayDeleteModal(status, deploymentId, id, name)}
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
