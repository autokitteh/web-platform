import { LoggerLevel } from "@enums";

interface Log {
	id: string;
	timestamp: string;
	message: string;
	status: LoggerLevel;
}

export interface LoggerStore {
	logs: Log[];
	addLog: (log: Omit<Log, "id">) => void;
	clearLogs: () => void;
}
