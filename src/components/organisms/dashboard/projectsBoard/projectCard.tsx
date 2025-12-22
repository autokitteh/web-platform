import React, { KeyboardEvent, MouseEvent } from "react";

import { useTranslation } from "react-i18next";
import { HiOutlineDotsVertical } from "react-icons/hi";

import { DeploymentStateVariant, SessionStateType } from "@enums";
import { DashboardProjectWithStats } from "@type/models";
import { cn } from "@utilities";

import { IconButton, IconSvg, SessionCountBadge } from "@components/atoms";
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
	const { id, name, status, deploymentId, running, completed, error } = project;
	const isActive = status === DeploymentStateVariant.active;

	const handleCardClick = () => {
		onRowClick(id);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleCardClick();
		}
	};

	const handleSessionClick = (
		event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
		sessionState: keyof typeof SessionStateType
	) => {
		event.stopPropagation();
		onSessionClick(event, id, sessionState);
	};

	const handleMenuAction =
		<T extends unknown[]>(action: (...args: T) => void, ...args: T) =>
		(e: MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			action(...args);
		};

	if (isLoading) {
		return (
			<div className="animate-pulse rounded-xl border border-gray-1050 bg-gray-1200/50 p-2">
				<div className="flex items-center gap-2">
					<div className="size-3 shrink-0 rounded-full bg-gray-1050" />
					<div className="h-4 w-24 rounded bg-gray-1050" />
					<div className="ml-auto flex gap-1.5">
						<div className="h-6 w-8 rounded-full bg-gray-1050" />
						<div className="h-6 w-8 rounded-full bg-gray-1050" />
						<div className="h-6 w-8 rounded-full bg-gray-1050" />
					</div>
					<div className="size-6 rounded bg-gray-1050" />
				</div>
			</div>
		);
	}

	if (hasError) {
		return (
			<div
				className="cursor-pointer rounded-xl border border-gray-1050 bg-gray-1200/50 p-2"
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
			className="cursor-pointer rounded-xl border border-gray-1050 bg-gray-1200/50 p-2 transition-all hover:border-gray-950 hover:bg-gray-1150 active:bg-gray-1100"
			onClick={handleCardClick}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
		>
			<div className="flex items-center gap-2">
				<div className="flex min-w-0 flex-1 items-center gap-2">
					<div
						className={cn("size-3 shrink-0 rounded-full", {
							"bg-green-800": isActive,
							"border-2 border-gray-750": !isActive,
						})}
					/>
					<span className="max-w-[100px] truncate font-fira-sans text-sm font-medium text-white">{name}</span>
				</div>

				<div className="flex shrink-0 items-center gap-1.5">
					<SessionCountBadge
						count={running}
						onClick={(e) => handleSessionClick(e, SessionStateType.running)}
						sessionType={SessionStateType.running}
						title={`${running} ${t("table.sessionTypes.running")}`}
						variant="compact"
					/>
					<SessionCountBadge
						count={completed}
						onClick={(e) => handleSessionClick(e, SessionStateType.completed)}
						sessionType={SessionStateType.completed}
						title={`${completed} ${t("table.sessionTypes.completed")}`}
						variant="compact"
					/>
					<SessionCountBadge
						count={error}
						onClick={(e) => handleSessionClick(e, SessionStateType.error)}
						sessionType={SessionStateType.error}
						title={`${error} ${t("table.sessionTypes.error")}`}
						variant="compact"
					/>
				</div>

				<PopoverWrapper interactionType="click" placement="bottom-end">
					<PopoverTrigger onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
						<IconButton aria-label={t("buttons.moreActions")} className="size-6 shrink-0 p-0.5">
							<HiOutlineDotsVertical className="size-4 text-gray-400" />
						</IconButton>
					</PopoverTrigger>
					<PopoverContent className="z-50 min-w-36 rounded-lg border border-gray-950 bg-gray-1100 p-1 shadow-xl">
						{status === DeploymentStateVariant.active ? (
							<button
								className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white hover:bg-gray-1000"
								onClick={handleMenuAction(onDeactivate, deploymentId)}
							>
								<ActionStoppedIcon className="size-4 fill-white" />
								{t("buttons.deactivate")}
							</button>
						) : null}
						<button
							className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-white hover:bg-gray-1000"
							onClick={handleMenuAction(onExport, id)}
						>
							<IconSvg className="stroke-white" size="sm" src={ExportIcon} />
							{t("buttons.export")}
						</button>
						<button
							className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-1000"
							onClick={handleMenuAction(onDelete, status, deploymentId, id, name)}
						>
							<IconSvg className="stroke-red-400" size="sm" src={TrashIcon} />
							{t("buttons.delete")}
						</button>
					</PopoverContent>
				</PopoverWrapper>
			</div>
		</div>
	);
};
