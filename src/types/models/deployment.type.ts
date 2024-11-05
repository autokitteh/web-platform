import { SessionStateType } from "@enums";

export type Deployment = {
	buildId: string;
	createdAt: Date;
	deploymentId: string;
	envId: string;
	sessionStats?: DeploymentSession[];
	state: number;
};

export type DeploymentSession = {
	count: number;
	state?: SessionStateType;
};