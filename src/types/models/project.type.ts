import { DeploymentStateVariant } from "@src/enums";

export type Project = {
	id: string;
	name: string;
	organizationId?: string;
};
export type DashboardProjectWithStats = {
	completed: number;
	deploymentId: string;
	error: number;
	id: string;
	lastDeployed?: Date | string;
	name: string;
	running: number;
	status: DeploymentStateVariant;
	stopped: number;
	totalDeployments: number;
};
