import { DashboardTimeRange } from "@constants";
import {
	DashboardSummary,
	EventsByTriggerData,
	IntegrationUsageData,
	RecentSessionData,
	SessionsOverTimeData,
	SessionStatusData,
} from "@interfaces/components/dashboardStats.interface";

export interface SessionStatistics {
	statusDistribution: SessionStatusData[];
	sessionsOverTime: SessionsOverTimeData[];
	recentSessions: RecentSessionData[];
	totalCount: number;
	successRate: number;
}

export interface EventStatistics {
	eventsByTrigger: EventsByTriggerData[];
	totalCount: number;
	eventsOverTime: Array<{ count: number; date: string }>;
}

export interface ConnectionStatistics {
	integrationUsage: IntegrationUsageData[];
	totalConnections: number;
	activeConnections: number;
}

export interface DashboardState {
	timeRange: DashboardTimeRange;
	autoRefreshIntervalMs: number;
	isAutoRefreshEnabled: boolean;
	lastUpdatedAt?: string;
	summary?: DashboardSummary;
	sessionStatsByScope: Record<string, SessionStatistics>;
	eventStatsByScope: Record<string, EventStatistics>;
	connectionStats?: ConnectionStatistics;
	isLoading: boolean;
	error?: string;
}

export interface DashboardActions {
	setTimeRange: (timeRange: DashboardTimeRange) => void;
	setAutoRefreshInterval: (ms: number) => void;
	toggleAutoRefresh: (enabled: boolean) => void;
	setSummary: (summary: DashboardSummary) => void;
	setSessionStats: (scopeKey: string, stats: SessionStatistics) => void;
	setEventStats: (scopeKey: string, stats: EventStatistics) => void;
	setConnectionStats: (stats: ConnectionStatistics) => void;
	setLoading: (isLoading: boolean) => void;
	setError: (error?: string) => void;
	setLastUpdatedAt: (timestamp: string) => void;
	clearStats: () => void;
	reset: () => void;
}

export type DashboardStore = DashboardState & DashboardActions;

export interface ScopeKeyParams {
	projectId?: string;
	deploymentId?: string;
	timeRange: DashboardTimeRange;
}
