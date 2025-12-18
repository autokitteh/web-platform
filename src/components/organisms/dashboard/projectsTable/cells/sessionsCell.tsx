import React, { KeyboardEvent, MouseEvent } from "react";

import { CellContext } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { SessionStateType } from "@enums";
import { ProjectsTableMeta } from "@interfaces/components";
import { DashboardProjectWithStats } from "@type/models";
import { cn, getSessionStateColor } from "@utilities";

import { SkeletonLoader } from "@components/organisms/configuration/shared";

export const SessionsCell = ({ row, table }: CellContext<DashboardProjectWithStats, unknown>) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { id, running, stopped, completed, error } = row.original;
	const meta = table.options.meta as ProjectsTableMeta;

	const countStyle = (state?: SessionStateType, className?: string) =>
		cn(
			"max-w-12 truncate border-0 px-1 py-2 text-sm font-medium sm:max-w-12 2xl:max-w-16 3xl:max-w-24",
			"inline-flex h-7 min-w-12 items-center justify-center rounded-3xl hover:bg-gray-1100",
			getSessionStateColor(state),
			className
		);

	const handleSessionClick = (
		event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
		sessionState: keyof typeof SessionStateType
	) => {
		event.stopPropagation();
		meta?.onSessionClick?.(event, id, sessionState);
	};

	const renderSessionCount = (count: number, type: SessionStateType, label: string) => (
		<div
			aria-label={t(`table.sessionTypes.${type}`)}
			className={countStyle(type)}
			onClick={(e) => handleSessionClick(e, type)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					handleSessionClick(e, type);
				}
			}}
			role="button"
			tabIndex={0}
			title={`${count} ${label}`}
		>
			{count}
		</div>
	);

	if (meta?.isLoadingStats(id)) {
		return <SkeletonLoader className="h-5" />;
	}

	if (meta?.hasLoadError(id)) {
		return <span className="text-gray-500">-</span>;
	}

	return (
		<>
			{renderSessionCount(running, SessionStateType.running, t("table.sessionTypes.running"))}
			{renderSessionCount(stopped, SessionStateType.stopped, t("table.sessionTypes.stopped"))}
			{renderSessionCount(completed, SessionStateType.completed, t("table.sessionTypes.completed"))}
			{renderSessionCount(error, SessionStateType.error, t("table.sessionTypes.error"))}
		</>
	);
};
