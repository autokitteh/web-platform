import { DeploymentSession } from "./deployment.type";

export type Project = {
	id: string;
	name: string;
};
export type DashboardProjectWithStats = {
	completed: number;
	error: number;
	id: string;
	name: string;
	running: number;
	sessionsStats: DeploymentSession[];
	stopped: number;
	totalDeployments: number;
};
