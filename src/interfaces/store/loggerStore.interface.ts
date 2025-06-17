import { LoggerLevel } from "@enums";
import { SessionEntrypoint } from "@src/interfaces/models";
import { LogType } from "@src/types/components";

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
	setNewLogs: (isNewLogs: boolean) => void;
	systemLogHeight: number;
	logs: Log[];
	isNewLogs: boolean;
	lastLogType: LogType;
}
