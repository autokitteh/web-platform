import { SessionActivity, SessionOutputLog } from "@src/interfaces/models";

export interface SessionActivityData {
	activities: SessionActivity[];
	nextPageToken?: string;
	fullyLoaded: boolean;
}

export interface SessionOutputData {
	outputs: SessionOutputLog[];
	nextPageToken?: string;
	fullyLoaded: boolean;
}

export interface ActivitiesStore {
	sessions: Record<string, SessionActivityData>;
	loading: boolean;
	loadLogs: (sessionId: string, pageSize?: number, force?: boolean) => Promise<{ error?: boolean }>;
}

export interface OutputsStore {
	sessions: Record<string, SessionOutputData>;
	loading: boolean;
	loadLogs: (sessionId: string, pageSize?: number, force?: boolean) => Promise<{ error?: boolean }>;
}
