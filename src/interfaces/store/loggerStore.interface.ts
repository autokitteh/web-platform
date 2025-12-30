import { LoggerLevel } from "@enums";
import { SessionEntrypoint } from "@src/interfaces/models";
import { LogType } from "@src/types/components";

export interface Log {
	id: string;
	message: string;
	status: LoggerLevel;
	timestamp: string;
	location?: SessionEntrypoint;
	ruleId?: string;
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
	systemLogNewItemsCount: number;
	systemLogIsAtBottom: boolean;
	setSystemLogNewItemsCount: (count: number | ((prev: number) => number)) => void;
	setSystemLogIsAtBottom: (isAtBottom: boolean) => void;
	scrollToSystemLogBottom: (() => void) | null;
	setScrollToSystemLogBottom: (fn: (() => void) | null) => void;
}
