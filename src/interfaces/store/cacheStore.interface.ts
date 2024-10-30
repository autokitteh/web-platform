import { BaseEvent, Connection, Deployment, Trigger, Variable } from "@src/types/models";

interface LoadingState {
	deployments: boolean;
	triggers: boolean;
	variables: boolean;
	events: boolean;
	connections: boolean;
}

export interface CacheStore {
	deployments?: Deployment[];
	hasActiveDeployments?: boolean;
	triggers: Trigger[];
	events?: BaseEvent[];
	variables: Variable[];
	connections?: Connection[];
	loading: LoadingState;
	currentProjectId?: string;
	envId?: string;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
	fetchTriggers: (projectId: string, force?: boolean) => Promise<void | Trigger[]>;
	fetchVariables: (projectId: string, force?: boolean) => Promise<void | Variable[]>;
	fetchEvents: (force?: boolean) => Promise<void | BaseEvent[]>;
	fetchConnections: (projectId: string, force?: boolean) => Promise<void | Connection[]>;
}
