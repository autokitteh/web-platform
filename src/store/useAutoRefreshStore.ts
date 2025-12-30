import { StateCreator, create } from "zustand";

import { Session } from "@src/interfaces/models";

export interface SessionsBuffer {
	sessions: Session[];
	count: number;
}

export interface LogsBuffer {
	sessionId: string;
	count: number;
	cursor: string | null;
}

interface AutoRefreshState {
	sessionsBuffer: SessionsBuffer;
	isSessionsAtTop: boolean;

	logsBufferBySession: Record<string, LogsBuffer>;
	logsAtBottomBySession: Record<string, boolean>;
	selectedSessionId: string | null;

	activitiesBufferBySession: Record<string, LogsBuffer>;
	activitiesAtBottomBySession: Record<string, boolean>;
}

interface AutoRefreshActions {
	setSessionsAtTop: (atTop: boolean) => void;
	addToSessionsBuffer: (sessions: Session[]) => void;
	clearSessionsBuffer: () => void;
	getSessionsBuffer: () => Session[];

	setLogsAtBottom: (sessionId: string, atBottom: boolean) => void;
	getLogsAtBottom: (sessionId: string) => boolean;
	setSelectedSessionId: (sessionId: string | null) => void;
	addToLogsBuffer: (sessionId: string, count: number, cursor: string | null) => void;
	clearLogsBuffer: (sessionId: string) => void;
	getLogsBuffer: (sessionId: string) => LogsBuffer | undefined;

	setActivitiesAtBottom: (sessionId: string, atBottom: boolean) => void;
	getActivitiesAtBottom: (sessionId: string) => boolean;
	addToActivitiesBuffer: (sessionId: string, count: number, cursor: string | null) => void;
	clearActivitiesBuffer: (sessionId: string) => void;
	getActivitiesBuffer: (sessionId: string) => LogsBuffer | undefined;

	reset: () => void;
}

type AutoRefreshStore = AutoRefreshState & AutoRefreshActions;

const initialState: AutoRefreshState = {
	sessionsBuffer: { sessions: [], count: 0 },
	isSessionsAtTop: true,

	logsBufferBySession: {},
	logsAtBottomBySession: {},
	selectedSessionId: null,

	activitiesBufferBySession: {},
	activitiesAtBottomBySession: {},
};

const createAutoRefreshStore: StateCreator<AutoRefreshStore> = (set, get) => ({
	...initialState,

	setSessionsAtTop: (atTop) => set({ isSessionsAtTop: atTop }),

	addToSessionsBuffer: (sessions) => {
		const current = get().sessionsBuffer;
		const existingIds = new Set(current.sessions.map((s) => s.sessionId));
		const newSessions = sessions.filter((s) => !existingIds.has(s.sessionId));

		if (newSessions.length === 0) return;

		set({
			sessionsBuffer: {
				sessions: [...newSessions, ...current.sessions],
				count: current.count + newSessions.length,
			},
		});
	},

	clearSessionsBuffer: () => {
		set({ sessionsBuffer: { sessions: [], count: 0 } });
	},

	getSessionsBuffer: () => get().sessionsBuffer.sessions,

	setLogsAtBottom: (sessionId, atBottom) =>
		set({
			logsAtBottomBySession: {
				...get().logsAtBottomBySession,
				[sessionId]: atBottom,
			},
		}),

	getLogsAtBottom: (sessionId) => get().logsAtBottomBySession[sessionId] ?? true,

	setSelectedSessionId: (sessionId) => set({ selectedSessionId: sessionId }),

	addToLogsBuffer: (sessionId, count, cursor) => {
		const current = get().logsBufferBySession[sessionId];
		set({
			logsBufferBySession: {
				...get().logsBufferBySession,
				[sessionId]: {
					sessionId,
					count: (current?.count || 0) + count,
					cursor,
				},
			},
		});
	},

	clearLogsBuffer: (sessionId) => {
		const current = get().logsBufferBySession;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [sessionId]: _removed, ...rest } = current;
		set({ logsBufferBySession: rest });
	},

	getLogsBuffer: (sessionId) => get().logsBufferBySession[sessionId],

	setActivitiesAtBottom: (sessionId, atBottom) =>
		set({
			activitiesAtBottomBySession: {
				...get().activitiesAtBottomBySession,
				[sessionId]: atBottom,
			},
		}),

	getActivitiesAtBottom: (sessionId) => get().activitiesAtBottomBySession[sessionId] ?? true,

	addToActivitiesBuffer: (sessionId, count, cursor) => {
		const current = get().activitiesBufferBySession[sessionId];
		set({
			activitiesBufferBySession: {
				...get().activitiesBufferBySession,
				[sessionId]: {
					sessionId,
					count: (current?.count || 0) + count,
					cursor,
				},
			},
		});
	},

	clearActivitiesBuffer: (sessionId) => {
		const current = get().activitiesBufferBySession;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [sessionId]: _removed, ...rest } = current;
		set({ activitiesBufferBySession: rest });
	},

	getActivitiesBuffer: (sessionId) => get().activitiesBufferBySession[sessionId],

	reset: () => set(initialState),
});

export const useAutoRefreshStore = create(createAutoRefreshStore);
