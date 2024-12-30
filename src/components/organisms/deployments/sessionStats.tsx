import React from "react";

import { useTranslation } from "react-i18next";

import { SessionStateType } from "@enums";
import { DeploymentSession } from "@type/models";
import { cn } from "@utilities";

export const DeploymentSessionStats = ({
	className,
	sessionStats,
}: {
	className?: string;
	sessionStats?: DeploymentSession[];
}) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessionStats" });
	const countStyle = (state?: SessionStateType) =>
		cn(
			"2xl:w-22 inline-block w-1/4 text-center border-0 p-0 text-sm font-medium",
			{
				"text-blue-500": state === SessionStateType.running,
				"text-yellow-500": state === SessionStateType.stopped,
				"text-green-800": state === SessionStateType.completed,
				"text-red": state === SessionStateType.error,
			},
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

	return sessionStatsOrdered.map(({ count, state }) => (
		<span
			aria-label={state}
			className={countStyle(state)}
			key={state}
			role="status"
			title={t(state?.toString() || "")}
		>
			{count}
		</span>
	));
};
