import { SessionStatsCountByState } from "@types/models";

export type SessionStatsFilterType = {
	sessionStats: SessionStatsCountByState;
	totalDeployments: number;
	totalSessionsCount: number;
};
