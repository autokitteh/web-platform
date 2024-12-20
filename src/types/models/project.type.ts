import { DeploymentStateVariant } from "@src/enums";

export type Project = {
	id: string;
	name: string;
};
export type DashboardProjectWithStats = {
	completed: number;
	error: number;
	id: string;
	lastDeployed?: Date | string;
	name: string;
	running: number;
	status: DeploymentStateVariant;
	stopped: number;
	totalDeployments: number;
};
