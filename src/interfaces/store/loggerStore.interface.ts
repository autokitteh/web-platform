import { LoggerLevel } from "@enums";

interface Log {
	id: string;
	message: string;
	status: LoggerLevel;
	timestamp: string;
}

export interface LoggerStore {
	addLog: (log: Omit<Log, "id">) => void;
	clearLogs: () => void;
	toggleLogger: (enabled: boolean) => void;
	logs: Log[];
	isLoggerEnabled: boolean;
	isNewLogs: boolean;
}
