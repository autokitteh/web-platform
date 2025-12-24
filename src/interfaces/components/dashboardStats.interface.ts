import { SessionStatus, TriggerType } from "@constants";
import { SessionsByStatus } from "@type/stores";

export interface SessionStatusData {
	status: SessionStatus;
	count: number;
}

export interface SessionsOverTimeData {
	date: string;
	completed: number;
	error: number;
	running: number;
	stopped: number;
}

export interface EventsByTriggerData {
	triggerType: TriggerType;
	count: number;
	percentage: number;
}

export interface IntegrationUsageData {
	integration: string;
	connectionCount: number;
	eventsTriggered: number;
}

export interface RecentSessionData {
	projectName: string;
	projectId: string;
	sessionId: string;
	status: SessionStatus;
	durationMs: number;
	lastActivityTime: string;
}

export interface DashboardSummary {
	totalProjects: number;
	totalProjectsChange?: number;
	activeSessions: number;
	activeSessionsChange?: number;
	successRate: number;
	successRateChange?: number;
	eventsProcessed: number;
	eventsProcessedChange?: number;
}

export type { SessionsByStatus };

export interface TotalCountersData {
	totalProjects: number;
	activeProjects: number;
	totalDeployments: number;
	activeDeployments: number;
	sessionsByStatus: SessionsByStatus;
}
