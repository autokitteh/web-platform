import { SessionEntrypoint } from "@type/models";

export type StartSessionArgsType = {
	buildId: string;
	deploymentId: string;
	entrypoint: Partial<SessionEntrypoint>;
	jsonInputs?: { [key: string]: string };
	sessionId?: string;
};
