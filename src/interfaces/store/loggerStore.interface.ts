import { LoggerLevel } from "@enums";
import { SessionEntrypoint } from "@src/interfaces/models";
import { LogType } from "@src/types/components";
import { lintViolationRules } from "@src/types/models/lintViolationCheck.type";

export interface Log {
	id: string;
	message: string;
	status: LoggerLevel;
	timestamp: string;
	location?: SessionEntrypoint;
	ruleId?: keyof typeof lintViolationRules;
	ruleMessage?: string;
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
