import { Deployment } from "@src/types/models";

interface LoadingState {
	deployments: boolean;
}

export interface CacheStore {
	deployments?: Deployment[];
	loading: LoadingState;
	currentProjectId?: string;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
}
