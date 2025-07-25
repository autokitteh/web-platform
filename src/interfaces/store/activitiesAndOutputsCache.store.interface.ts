import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionActivity, SessionOutputLog } from "@src/interfaces/models";

export interface SessionActivityData {
	activities: SessionActivity[];
	baseActivities: ProtoSessionLogRecord[];
	nextPageToken?: string;
	hasLastSessionState?: boolean;
}

export interface SessionOutputData {
	outputs: SessionOutputLog[];
	nextPageToken?: string;
	hasLastSessionState: boolean;
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
