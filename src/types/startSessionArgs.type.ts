import { SessionEntrypoint } from "@src/interfaces/models";

export type StartSessionArgsType = {
	buildId: string;
	deploymentId: string;
	entrypoint: SessionEntrypoint;
	jsonInputs?: { [key: string]: string };
	sessionId?: string;
};
