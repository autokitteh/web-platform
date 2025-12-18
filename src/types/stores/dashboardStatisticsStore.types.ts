import { SessionStatus } from "@constants";
import { ActivityState } from "@constants/activities.constants";

export interface ActiveDeploymentData {
	deploymentId: string;
	projectName: string;
	projectId: string;
	createdAt?: Date;
}

export interface SessionsByStatus {
	completed: number;
	running: number;
	error: number;
	stopped: number;
	created: number;
}

export interface DashboardStatistics {
	totalProjects: number;
	activeProjects: number;
	totalDeployments: number;
	activeDeployments: number;
	sessionsByStatus: SessionsByStatus;
}

export interface SessionStatusChartData {
	status: SessionStatus;
	count: number;
}

export interface DashboardStatisticsState {
	statistics: DashboardStatistics;
	activeDeploymentsList: ActiveDeploymentData[];
	sessionStatusData: SessionStatusChartData[];
	isLoading: boolean;
}

export interface DashboardStatisticsActions {
	setStatistics: (stats: DashboardStatistics) => void;
	setActiveDeployments: (deployments: ActiveDeploymentData[]) => void;
	setSessionStatusData: (data: SessionStatusChartData[]) => void;
	setIsLoading: (loading: boolean) => void;
	reset: () => void;
}

export type DashboardStatisticsStore = DashboardStatisticsState & DashboardStatisticsActions;

export { ActivityState };
