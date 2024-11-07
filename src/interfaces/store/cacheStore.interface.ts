import { BaseEvent, Connection, Deployment, Trigger, Variable } from "@src/types/models";

export type ProjectValidationLevel = "error" | "warning";

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
	projectValidationState: {
		code: {
			level?: ProjectValidationLevel;
			message?: string;
		};
		connections: {
			level?: ProjectValidationLevel;
			message?: string;
		};
		triggers: {
			level?: ProjectValidationLevel;
			message?: string;
		};
		variables: {
			level?: ProjectValidationLevel;
			message?: string;
		};
	};
	checkState: (
		projectId: string,
		data?: {
			connections?: Connection[];
			resources?: Record<string, Uint8Array>;
			triggers?: Trigger[];
			variables?: Variable[];
		}
	) => void;
	isValid: boolean;
	initCache: (projectId: string, force?: boolean) => Promise<void>;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
	fetchTriggers: (projectId: string, force?: boolean) => Promise<void | Trigger[]>;
	fetchVariables: (projectId: string, force?: boolean) => Promise<void | Variable[]>;
	fetchEvents: (force?: boolean) => Promise<void | BaseEvent[]>;
	fetchConnections: (projectId: string, force?: boolean) => Promise<void | Connection[]>;
}
