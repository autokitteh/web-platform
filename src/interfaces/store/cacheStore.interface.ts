import { BaseEvent, Connection, Deployment, Integration, Trigger, Variable } from "@src/types/models";

export type ProjectValidationLevel = "error" | "warning";

interface LoadingState {
	deployments: boolean;
	triggers: boolean;
	variables: boolean;
	events: boolean;
	connections: boolean;
	resourses: boolean;
}

export interface CacheStore {
	deployments?: Deployment[];
	triggers: Trigger[];
	events?: BaseEvent[];
	integrations?: Integration[];
	variables: Variable[];
	connections?: Connection[];
	resourses?: Record<string, Uint8Array>;
	loading: LoadingState;
	currentProjectId?: string;
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
	fetchResources: (projectId: string, force?: boolean) => Promise<void | Record<string, Uint8Array>>;
	fetchTriggers: (projectId: string, force?: boolean) => Promise<void | Trigger[]>;
	fetchVariables: (projectId: string, force?: boolean) => Promise<void | Variable[]>;
	fetchEvents: (force?: boolean, destinationId?: string) => Promise<void | BaseEvent[]>;
	fetchConnections: (projectId: string, force?: boolean) => Promise<void | Connection[]>;
	reset: (type: "resources" | "connections" | "deployments" | "triggers" | "variables") => void;
}
