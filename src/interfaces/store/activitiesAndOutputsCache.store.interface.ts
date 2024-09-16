import { SessionActivity, SessionOutput } from "@src/types/models";

export interface ActivitySession {
	activities: SessionActivity[];
	nextPageToken: string | undefined;
	fullyLoaded: boolean;
}

export interface ActivitiesStore {
	sessions: Record<string, ActivitySession>;
	loading: boolean;
	reset: (sessionId: string) => void;
	reload: (sessionId: string) => void;
	loadLogs: (sessionId: string, pageSize?: number) => Promise<void>;
}

export interface OutputSession {
	outputs: SessionOutput[];
	nextPageToken: string | undefined;
	fullyLoaded: boolean;
}

export interface OutputsStore {
	sessions: Record<string, OutputSession>;
	loading: boolean;
	reset: (sessionId: string) => void;
	reload: (sessionId: string) => void;
	loadLogs: (sessionId: string, pageSize?: number) => Promise<void>;
}
