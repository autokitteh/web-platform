import { FrontendProjectValidationProps } from "../components";
import { BaseEvent, Connection, Deployment, Integration, Trigger, Variable } from "@src/types/models";
import { ProjectValidationLevel } from "@src/types/stores/cacheStore.types";

export type { ProjectValidationLevel };

interface LoadingState {
	deployments: boolean;
	triggers: boolean;
	variables: boolean;
	events: boolean;
	connections: boolean;
	resources: boolean;
	code: boolean;
}

export interface CacheStore {
	deployments?: Deployment[];
	triggers: Trigger[];
	events?: BaseEvent[];
	integrations?: Integration[];
	variables: Variable[];
	connections?: Connection[];
	resources?: Record<string, Uint8Array>;
	loading: LoadingState;
	currentProjectId?: string;
	projectValidationState: {
		code: FrontendProjectValidationProps;
		connections: FrontendProjectValidationProps;
		triggers: FrontendProjectValidationProps;
		variables: FrontendProjectValidationProps;
	};
	setLoading: (key: keyof LoadingState, value: boolean) => void;
	checkState: (
		projectId: string,
		data?: {
			connections?: Connection[];
			resources?: Record<string, Uint8Array>;
			triggers?: Trigger[];
			variables?: Variable[];
		}
	) => Promise<void>;
	getLatestValidationState: (
		projectId: string,
		section: "code" | "connections" | "triggers" | "variables"
	) => Promise<CacheStore["projectValidationState"]>;
	isValid: boolean;
	isProjectEvents: boolean;
	initCache: (
		projectId: string,
		force?: boolean
	) => Promise<
		[
			void | Record<string, Uint8Array>,
			void | Deployment[],
			void | Trigger[],
			void | Variable[],
			void | Connection[],
		]
	>;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
	fetchResources: (projectId: string, force?: boolean) => Promise<void | Record<string, Uint8Array>>;
	fetchTriggers: (projectId: string, force?: boolean) => Promise<void | Trigger[]>;
	fetchVariables: (projectId: string, force?: boolean) => Promise<void | Variable[]>;
	fetchEvents: ({ projectId, sourceId }: { projectId?: string; sourceId?: string }) => Promise<void>;
	fetchConnections: (projectId: string, force?: boolean) => Promise<void | Connection[]>;
	reset: (type: "resources" | "connections" | "deployments" | "triggers" | "variables") => void;
}
