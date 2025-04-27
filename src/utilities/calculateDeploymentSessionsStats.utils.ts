import { cloneDeep } from "lodash";

import { SessionStateType } from "@enums";
import { SessionStatsFilterType } from "@type/components";
import { Deployment } from "@type/models";

export const calculateDeploymentSessionsStats = (deployments: Deployment[]): SessionStatsFilterType => {
	const allSessionStats = deployments.flatMap((deployment) => deployment.sessionStats || []);
	let totalSessionsCount = 0;

	const resetSessionStats = cloneDeep(initialSessionCounts);

	const sessionStats = allSessionStats.reduce<Record<SessionStateType, number>>((acc, { count, state }) => {
		if (!state) return acc;

		acc[state] = (acc[state] || 0) + count;

		if (state === SessionStateType.created) {
			acc[SessionStateType.running] = (acc[SessionStateType.running] || 0) + count;
		}

		totalSessionsCount += count;

		return acc;
	}, resetSessionStats);

	return {
		sessionStats,
		totalDeployments: deployments.length,
		totalSessionsCount,
	};
};

export const initialSessionCounts = {
	[SessionStateType.completed]: 0,
	[SessionStateType.created]: 0,
	[SessionStateType.error]: 0,
	[SessionStateType.running]: 0,
	[SessionStateType.stopped]: 0,
};
