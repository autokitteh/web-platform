import React, { KeyboardEvent, MouseEvent } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { SessionStateType } from "@enums";
import { SidebarHrefMenu } from "@src/enums/components";
import { DeploymentSession } from "@type/models";
import { cn, getSessionStateColor } from "@utilities";

export const DeploymentSessionStats = ({
	className,
	deploymentId,
	sessionStats,
}: {
	className?: string;
	deploymentId: string;
	sessionStats?: DeploymentSession[];
}) => {
	const navigate = useNavigate();
	const { projectId } = useParams();
	const { t } = useTranslation("deployments", { keyPrefix: "sessionStats" });
	const countStyle = (state?: SessionStateType) =>
		cn(
			"min-w-12 max-w-12 sm:max-w-12 2xl:max-w-18 3xl:max-w-24 inline-block text-center border-0 p-0 text-sm font-medium",
			"hover:bg-gray-1100 rounded-3xl inline-flex justify-center items-center h-7",
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
		navigate(`/${SidebarHrefMenu.projects}/${projectId}/deployments/${deploymentId}/sessions${stateFilter}`);
	};

	return sessionStatsOrdered.map(({ count, state }) => (
		<div
			aria-label={`${count} ${t(state?.toString() || "")}`}
			className={countStyle(state)}
			key={state}
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
	));
};
