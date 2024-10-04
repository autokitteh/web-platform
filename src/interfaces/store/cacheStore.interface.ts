import { Deployment, Trigger } from "@src/types/models";

interface LoadingState {
	deployments: boolean;
	triggers: boolean;
}

export interface CacheStore {
	deployments?: Deployment[];
	triggers: Trigger[];
	loading: LoadingState;
	currentProjectId?: string;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
	fetchTriggers: (projectId: string, force?: boolean) => Promise<void | Trigger[]>;
}
