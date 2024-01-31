import { SessionStateType } from "@enums";

export type Deployment = {
	deploymentId: string;
	envId: string;
	buildId: string;
	createdAt: Date;
	state: number;
	sessionStats?: {
		state?: SessionStateType;
		count: number;
	}[];
};
