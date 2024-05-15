import { SessionStateType } from "@enums";

export type Deployment = {
	deploymentId: string;
	envId: string;
	buildId: string;
	createdAt: Date;
	state: number;
	sessionStats?: DeploymentSession[];
};

export type DeploymentSession = {
	state?: SessionStateType;
	count: number;
};
