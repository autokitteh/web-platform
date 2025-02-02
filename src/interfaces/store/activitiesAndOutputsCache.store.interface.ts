import { SessionActivity, SessionOutput } from "@src/interfaces/models";

export interface SessionActivityData {
	activities: SessionActivity[];
	nextPageToken?: string;
	fullyLoaded: boolean;
}

export interface SessionOutputData {
	outputs: SessionOutput[];
	nextPageToken?: string;
	fullyLoaded: boolean;
}

export interface ActivitiesStore {
	sessions: Record<string, SessionActivityData>;
	loading: boolean;
	loadLogs: (sessionId: string, pageSize?: number, force?: boolean) => Promise<void>;
}

export interface OutputsStore {
	sessions: Record<string, SessionOutputData>;
	loading: boolean;
	loadLogs: (sessionId: string, pageSize?: number, force?: boolean) => Promise<void>;
}
