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
	isEnabled: boolean;
	isPaused: boolean;
	countdownMs: number;
	intervalMs: number;

	sessionsBuffer: SessionsBuffer;
	isSessionsAtTop: boolean;

	logsBufferBySession: Record<string, LogsBuffer>;
	isLogsAtBottom: boolean;
	selectedSessionId: string | null;

	activitiesBufferBySession: Record<string, LogsBuffer>;
	isActivitiesAtBottom: boolean;
}

interface AutoRefreshActions {
	setEnabled: (enabled: boolean) => void;
	setPaused: (paused: boolean) => void;
	setCountdownMs: (ms: number) => void;
	setIntervalMs: (ms: number) => void;

	setSessionsAtTop: (atTop: boolean) => void;
	addToSessionsBuffer: (sessions: Session[]) => void;
	clearSessionsBuffer: () => void;
	getSessionsBuffer: () => Session[];

	setLogsAtBottom: (atBottom: boolean) => void;
	setSelectedSessionId: (sessionId: string | null) => void;
	addToLogsBuffer: (sessionId: string, count: number, cursor: string | null) => void;
	clearLogsBuffer: (sessionId: string) => void;
	getLogsBuffer: (sessionId: string) => LogsBuffer | undefined;

	setActivitiesAtBottom: (atBottom: boolean) => void;
	addToActivitiesBuffer: (sessionId: string, count: number, cursor: string | null) => void;
	clearActivitiesBuffer: (sessionId: string) => void;
	getActivitiesBuffer: (sessionId: string) => LogsBuffer | undefined;

	reset: () => void;
}

type AutoRefreshStore = AutoRefreshState & AutoRefreshActions;

const DEFAULT_INTERVAL_MS = 60000;

const initialState: AutoRefreshState = {
	isEnabled: true,
	isPaused: false,
	countdownMs: DEFAULT_INTERVAL_MS,
	intervalMs: DEFAULT_INTERVAL_MS,

	sessionsBuffer: { sessions: [], count: 0 },
	isSessionsAtTop: true,

	logsBufferBySession: {},
	isLogsAtBottom: true,
	selectedSessionId: null,

	activitiesBufferBySession: {},
	isActivitiesAtBottom: true,
};

const createAutoRefreshStore: StateCreator<AutoRefreshStore> = (set, get) => ({
	...initialState,

	setEnabled: (enabled) => set({ isEnabled: enabled }),
	setPaused: (paused) => set({ isPaused: paused }),
	setCountdownMs: (ms) => set({ countdownMs: ms }),
	setIntervalMs: (ms) => set({ intervalMs: ms }),

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

	setLogsAtBottom: (atBottom) => set({ isLogsAtBottom: atBottom }),

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
		const { [sessionId]: removed, ...rest } = current;
		void removed;
		set({ logsBufferBySession: rest });
	},

	getLogsBuffer: (sessionId) => get().logsBufferBySession[sessionId],

	setActivitiesAtBottom: (atBottom) => set({ isActivitiesAtBottom: atBottom }),

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
		const { [sessionId]: removed, ...rest } = current;
		void removed;
		set({ activitiesBufferBySession: rest });
	},

	getActivitiesBuffer: (sessionId) => get().activitiesBufferBySession[sessionId],

	reset: () => set(initialState),
});

export const useAutoRefreshStore = create(createAutoRefreshStore);
