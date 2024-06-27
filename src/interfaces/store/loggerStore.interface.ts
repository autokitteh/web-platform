interface Log {
	id: string;
	timestamp: string;
	message: string;
}

export interface LoggerStore {
	logs: Log[];
	addLog: (log: Omit<Log, "id">) => void;
	clearLogs: () => void;
}
