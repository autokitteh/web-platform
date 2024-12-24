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
	setSystemLogHeight: (height: number) => void;
	systemLogHeight: number;
	logs: Log[];
	isNewLogs: boolean;
}
