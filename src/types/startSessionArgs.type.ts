import { SessionEntrypoint } from "@type/models";

export type StartSessionArgsType = {
	buildId: string;
	deploymentId: string;
	entrypoint: SessionEntrypoint;
	jsonInputs?: { [key: string]: string };
	sessionId?: string;
};
