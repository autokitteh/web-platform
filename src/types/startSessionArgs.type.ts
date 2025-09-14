import { SessionEntrypoint } from "@src/interfaces/models";

export type StartSessionArgsType = {
	buildId: string;
	deploymentId: string;
	entrypoint: SessionEntrypoint;
	isDurable?: boolean;
	jsonInputs?: string;
	sessionId?: string;
};
