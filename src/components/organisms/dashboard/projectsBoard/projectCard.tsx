import React, { KeyboardEvent, MouseEvent } from "react";

import { useTranslation } from "react-i18next";
import { HiOutlineDotsVertical } from "react-icons/hi";

import { DeploymentStateVariant, SessionStateType } from "@enums";
import { DashboardProjectWithStats } from "@type/models";
import { cn, formatDateShort, getSessionStateColor } from "@utilities";

import { IconButton, IconSvg, StatusBadge } from "@components/atoms";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { ActionStoppedIcon, ExportIcon, TrashIcon } from "@assets/image/icons";

export interface ProjectCardProps {
	project: DashboardProjectWithStats;
	isLoading?: boolean;
	hasError?: boolean;
	onRowClick: (projectId: string) => void;
	onDeactivate: (deploymentId: string) => Promise<void>;
	onExport: (projectId: string) => void;
	onDelete: (status: DeploymentStateVariant, deploymentId: string, projectId: string, name: string) => void;
	onSessionClick: (
		event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
		projectId: string,
		sessionState: keyof typeof SessionStateType
	) => void;
}

export const ProjectCard = ({
	project,
	isLoading,
	hasError,
	onRowClick,
	onDeactivate,
	onExport,
	onDelete,
	onSessionClick,
}: ProjectCardProps) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { id, name, status, deploymentId, totalDeployments, running, completed, error, lastDeployed } = project;

	const handleCardClick = () => {
		onRowClick(id);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleCardClick();
		}
	};

	const sessionCountStyle = (state?: SessionStateType) =>
		cn(
			"inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-xs font-medium",
			getSessionStateColor(state)
		);

	const handleSessionClick = (
		event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
		sessionState: keyof typeof SessionStateType
	) => {
		event.stopPropagation();
		onSessionClick(event, id, sessionState);
	};

	if (isLoading) {
		return (
			<div className="animate-pulse rounded-xl border border-gray-1050 bg-gray-1200/50 p-3">
				<div className="flex items-center justify-between">
					<div className="h-4 w-32 rounded bg-gray-1050" />
					<div className="h-5 w-16 rounded-full bg-gray-1050" />
				</div>
				<div className="mt-3 flex gap-2">
					<div className="h-6 w-12 rounded-full bg-gray-1050" />
					<div className="h-6 w-12 rounded-full bg-gray-1050" />
					<div className="h-6 w-12 rounded-full bg-gray-1050" />
				</div>
				<div className="mt-2 flex items-center justify-between">
					<div className="h-3 w-20 rounded bg-gray-1050" />
					<div className="h-3 w-16 rounded bg-gray-1050" />
				</div>
			</div>
		);
	}

	if (hasError) {
		return (
			<div
				className="cursor-pointer rounded-xl border border-gray-1050 bg-gray-1200/50 p-3"
				onClick={handleCardClick}
				onKeyDown={handleKeyDown}
				role="button"
				tabIndex={0}
			>
				<div className="flex items-center justify-between">
					<span className="truncate font-fira-sans text-sm font-medium text-white">{name}</span>
					<span className="text-xs text-gray-500">{t("table.loadError")}</span>
				</div>
			</div>
		);
	}

	return (
		<div
			className="cursor-pointer rounded-xl border border-gray-1050 bg-gray-1200/50 p-3 transition-all hover:border-gray-950 hover:bg-gray-1150 active:bg-gray-1100"
			onClick={handleCardClick}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
		>
			<div className="flex items-center justify-between gap-2">
				<span className="truncate font-fira-sans text-sm font-medium text-white">{name}</span>
				<div className="flex shrink-0 items-center gap-1">
					<PopoverWrapper interactionType="click" placement="bottom-end">
						<PopoverTrigger onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
							<IconButton aria-label={t("buttons.moreActions")} className="size-6 p-0.5">
								<HiOutlineDotsVertical className="size-4 text-gray-400" />
							</IconButton>
						</PopoverTrigger>
						<PopoverContent className="z-50 min-w-36 rounded-lg border border-gray-950 bg-gray-1100 p-1 shadow-xl">
							{status === DeploymentStateVariant.active ? (
								<button
									className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white hover:bg-gray-1000"
									onClick={() => onDeactivate(deploymentId)}
								>
									<ActionStoppedIcon className="size-4 fill-white" />
									Deactivate
								</button>
							) : null}
							<button
								className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white hover:bg-gray-1000"
								onClick={() => onExport(id)}
							>
								<IconSvg className="stroke-white" size="sm" src={ExportIcon} />
								Export
							</button>
							<button
								className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-1000"
								onClick={() => onDelete(status, deploymentId, id, name)}
							>
								<IconSvg className="stroke-red-400" size="sm" src={TrashIcon} />
								Delete
							</button>
						</PopoverContent>
					</PopoverWrapper>
				</div>
			</div>

			<div className="mt-2 flex items-center justify-between">
				<div className="flex flex-wrap items-center gap-1.5">
					<div
						className={sessionCountStyle(SessionStateType.running)}
						onClick={(e) => handleSessionClick(e, SessionStateType.running)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") handleSessionClick(e, SessionStateType.running);
						}}
						role="button"
						tabIndex={0}
						title={`${running} ${t("table.sessionTypes.running")}`}
					>
						{running}
					</div>
					<div
						className={sessionCountStyle(SessionStateType.completed)}
						onClick={(e) => handleSessionClick(e, SessionStateType.completed)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") handleSessionClick(e, SessionStateType.completed);
						}}
						role="button"
						tabIndex={0}
						title={`${completed} ${t("table.sessionTypes.completed")}`}
					>
						{completed}
					</div>
					<div
						className={sessionCountStyle(SessionStateType.error)}
						onClick={(e) => handleSessionClick(e, SessionStateType.error)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") handleSessionClick(e, SessionStateType.error);
						}}
						role="button"
						tabIndex={0}
						title={`${error} ${t("table.sessionTypes.error")}`}
					>
						{error}
					</div>
				</div>
				<StatusBadge deploymentStatus={status} />
			</div>

			<div className="mt-2 flex items-center justify-between text-xs text-gray-500">
				<span className="font-fira-code">
					{totalDeployments} {t("table.deployments")}
				</span>
				<span className="font-fira-code">{formatDateShort(lastDeployed)}</span>
			</div>
		</div>
	);
};
