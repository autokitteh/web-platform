import { LoggerLevel } from "@enums";
import { SessionEntrypoint } from "@interfaces/models";

export interface Log {
	id: string;
	message: string;
	status: LoggerLevel;
	timestamp: string;
	location?: SessionEntrypoint;
}

export interface LoggerStore {
	addLog: (log: Omit<Log, "id">) => void;
	clearLogs: () => void;
	setSystemLogHeight: (height: number) => void;
	systemLogHeight: number;
	logs: Log[];
	isNewLogs: boolean;
}
