import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { Deployment } from "@src/types/models";

interface LoadingState {
	logs: boolean;
	deployments: boolean;
}

export interface CacheStore {
	logs: ProtoSessionLogRecord[];
	deployments?: Deployment[];
	loading: LoadingState;
	nextPageToken: string;
	currentProjectId?: string;
	reset: () => void;
	reload: (sessionId: string) => void;
	loadLogs: (sessionId: string, pageSize?: number) => Promise<void>;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<void | Deployment[]>;
}
