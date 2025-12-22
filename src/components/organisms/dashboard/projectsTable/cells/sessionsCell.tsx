import { KeyboardEvent, MouseEvent } from "react";

import { CellContext } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { SessionStateType } from "@enums";
import { ProjectsTableMeta } from "@interfaces/components";
import { DashboardProjectWithStats } from "@type/models";

import { SessionCountBadge } from "@components/atoms";
import { SkeletonLoader } from "@components/organisms/configuration/shared";

export const SessionsCell = ({ row, table }: CellContext<DashboardProjectWithStats, unknown>) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { id, running, stopped, completed, error } = row.original;
	const meta = table.options.meta as ProjectsTableMeta;

	const handleSessionClick = (
		event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
		sessionState: keyof typeof SessionStateType
	) => {
		event.stopPropagation();
		meta?.onSessionClick?.(event, id, sessionState);
	};

	if (meta?.isLoadingStats(id)) {
		return <SkeletonLoader className="h-5" />;
	}

	if (meta?.hasLoadError(id)) {
		return <span className="text-gray-500">-</span>;
	}

	return (
		<>
			<SessionCountBadge
				count={running}
				onClick={(e) => handleSessionClick(e, SessionStateType.running)}
				sessionType={SessionStateType.running}
				title={`${running} ${t("table.sessionTypes.running")}`}
			/>
			<SessionCountBadge
				count={stopped}
				onClick={(e) => handleSessionClick(e, SessionStateType.stopped)}
				sessionType={SessionStateType.stopped}
				title={`${stopped} ${t("table.sessionTypes.stopped")}`}
			/>
			<SessionCountBadge
				count={completed}
				onClick={(e) => handleSessionClick(e, SessionStateType.completed)}
				sessionType={SessionStateType.completed}
				title={`${completed} ${t("table.sessionTypes.completed")}`}
			/>
			<SessionCountBadge
				count={error}
				onClick={(e) => handleSessionClick(e, SessionStateType.error)}
				sessionType={SessionStateType.error}
				title={`${error} ${t("table.sessionTypes.error")}`}
			/>
		</>
	);
};
