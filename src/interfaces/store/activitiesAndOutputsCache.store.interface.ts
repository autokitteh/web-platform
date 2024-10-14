import { SessionActivity, SessionOutput } from "@src/types/models";

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
	reset: (sessionId: string) => void;
	reload: (sessionId: string, pageSize: number) => void;
	loadLogs: (sessionId: string, pageSize?: number) => Promise<void>;
}

export interface OutputsStore {
	sessions: Record<string, SessionOutputData>;
	loading: boolean;
	reset: (sessionId: string) => void;
	reload: (sessionId: string, pageSize: number) => void;
	loadLogs: (sessionId: string, pageSize?: number) => Promise<void>;
}
