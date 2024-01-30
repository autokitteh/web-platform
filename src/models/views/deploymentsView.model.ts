import { Deployment } from "@type/models";

export type DeploymentSectionViewModel = {
	deployments?: Deployment[];
	totalDeployments?: number;
	selectedDeploymentId?: string;
};
