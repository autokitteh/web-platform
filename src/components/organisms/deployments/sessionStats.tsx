import React, { KeyboardEvent, MouseEvent } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { SessionStateType } from "@enums";
import { SidebarHrefMenu } from "@src/enums/components";
import { DeploymentSession } from "@type/models";
import { cn, getSessionStateColor, useNavigateWithSettings } from "@utilities";

export const DeploymentSessionStats = ({
	className,
	deploymentId,
	sessionStats,
}: {
	className?: string;
	deploymentId: string;
	sessionStats?: DeploymentSession[];
}) => {
	const navigateWithSettings = useNavigateWithSettings();
	const { projectId } = useParams();
	const { t } = useTranslation("deployments", { keyPrefix: "sessionStats" });
	const countStyle = (state?: SessionStateType) =>
		cn(
			"flex w-full justify-center truncate rounded-3xl pl-1 text-center text-sm font-medium",
			getSessionStateColor(state),
			className
		);

	const sessionStatsOrdered = [
		{
			count:
				(sessionStats?.find(({ state }) => state === SessionStateType.running)?.count || 0) +
				(sessionStats?.find(({ state }) => state === SessionStateType.created)?.count || 0),
			state: SessionStateType.running,
		},
		sessionStats?.find(({ state }) => state === SessionStateType.stopped) || {
			count: 0,
			state: SessionStateType.stopped,
		},
		sessionStats?.find(({ state }) => state === SessionStateType.completed) || {
			count: 0,
			state: SessionStateType.completed,
		},
		sessionStats?.find(({ state }) => state === SessionStateType.error) || {
			count: 0,
			state: SessionStateType.error,
		},
	];

	const handleOpenProjectFilteredSessions = (
		event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
		sessionState?: keyof typeof SessionStateType
	) => {
		event.stopPropagation();
		const stateFilter = sessionState ? `?sessionState=${sessionState}` : "";
		navigateWithSettings(
			`/${SidebarHrefMenu.projects}/${projectId}/deployments/${deploymentId}/sessions${stateFilter}`
		);
	};

	return sessionStatsOrdered.map(({ count, state }) => (
		<div className={countStyle(state)} key={state}>
			<div
				aria-label={`${count} ${t(state?.toString() || "")}`}
				className="inline-block min-w-12 truncate rounded-3xl px-2.5 py-1 hover:bg-gray-1100"
				onClick={(event) => {
					handleOpenProjectFilteredSessions(event, state);
				}}
				onKeyDown={(event) => {
					handleOpenProjectFilteredSessions(event, state);
				}}
				role="button"
				tabIndex={0}
				title={`${count} ${t(state?.toString() || "")}`}
			>
				{count}
			</div>
		</div>
	));
};
