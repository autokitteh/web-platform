import { SessionStatsCountByState } from "@type/models";

export type SessionStatsFilterType = {
	sessionStats: SessionStatsCountByState;
	totalDeployments: number;
	totalSessionsCount: number;
};
