import { Deployment, Trigger, Variable } from "@src/types/models";

interface LoadingState {
	deployments: boolean;
	triggers: boolean;
	variables: boolean;
}

export interface CacheStore {
	deployments?: Deployment[];
	triggers: Trigger[];
	variables: Variable[];
	loading: LoadingState;
	currentProjectId?: string;
	envId?: string;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
	fetchTriggers: (projectId: string, force?: boolean) => Promise<void | Trigger[]>;
	fetchVariables: (projectId: string, force?: boolean) => Promise<void | Variable[]>;
}
