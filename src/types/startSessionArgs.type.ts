import { SessionEntrypoint } from "@type/models";

export type StartSessionArgsType = {
	sessionId?: string;
	deploymentId: string;
	buildId: string;
	entrypoint: SessionEntrypoint;
};
