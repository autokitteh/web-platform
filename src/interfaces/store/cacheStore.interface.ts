import { Deployment, Event, Trigger } from "@src/types/models";

interface LoadingState {
	deployments: boolean;
	triggers: boolean;
	events: boolean;
}

export interface CacheStore {
	deployments?: Deployment[];
	triggers: Trigger[];
	fetchTriggers: (projectId: string, force?: boolean) => Promise<void | Trigger[]>;
	events?: Event[];
	loading: LoadingState;
	currentProjectId?: string;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
	fetchEvents: (force?: boolean) => Promise<Event[] | void>;
}
