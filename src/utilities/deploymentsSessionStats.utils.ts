import { SessionStateType } from "@src/enums";
import { Deployment } from "@src/types/models";

export const deploymentsSessionStats = (deployments: Deployment[]) => {
	const allSessionStats = deployments.flatMap((deployment) => deployment.sessionStats || []);

	const sessionStats = allSessionStats.reduce<Record<string, { count: number; state: string }>>(
		(acc, { count, state }) => {
			if (!state) return acc;

			acc[state] = {
				state,
				count: (acc[state]?.count || 0) + count,
			};

			if (state === SessionStateType.created) {
				acc[SessionStateType.running] = {
					state: SessionStateType.running,
					count: (acc[SessionStateType.running]?.count || 0) + count,
				};
			}

			return acc;
		},
		{}
	);

	return {
		sessionStats,
		totalDeployments: deployments.length,
	};
};
