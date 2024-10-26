import { BaseEvent, Deployment, Trigger, Variable } from "@src/types/models";

interface LoadingState {
	deployments: boolean;
	triggers: boolean;
	variables: boolean;
	events: boolean;
}

export interface ExtractedFile {
	filename: string;
	content: Uint8Array;
	size: number;
}

export interface CacheStore {
	deployments?: Deployment[];
	triggers: Trigger[];
	events?: BaseEvent[];
	variables: Variable[];
	loading: LoadingState;
	currentProjectId?: string;
	envId?: string;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
	fetchTriggers: (projectId: string, force?: boolean) => Promise<void | Trigger[]>;
	fetchVariables: (projectId: string, force?: boolean) => Promise<void | Variable[]>;
	fetchEvents: (force?: boolean) => Promise<void | BaseEvent[]>;
}
