import randomatic from "randomatic";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

import { maxLogs } from "@constants";
import { LoggerLevel, StoreName } from "@enums";
import { LoggerStore } from "@interfaces/store";
import { LogType } from "@src/types/components";

const store: StateCreator<LoggerStore> = (set) => ({
	logs: [],
	isNewLogs: false,
	lastLogType: "error" as LogType,
	systemLogHeight: 0,
	systemLogNewItemsCount: 0,
	systemLogIsAtBottom: true,
	scrollToSystemLogBottom: null,

	addLog: (log) => {
		const newLog = { ...log, id: randomatic("Aa0", 5) };
		set((state) => {
			const updatedLogs = [newLog, ...state.logs];
			if (updatedLogs.length > maxLogs) {
				updatedLogs.splice(maxLogs);
			}

			const shouldDisplayNotification = log.status === LoggerLevel.error || log.status === LoggerLevel.warn;
			const lastLogType: LogType = log.status === LoggerLevel.error ? "error" : "warning";

			return {
				logs: updatedLogs,
				isNewLogs: shouldDisplayNotification || state.isNewLogs,
				lastLogType,
			};
		});
	},

	clearLogs: () =>
		set(() => ({
			logs: [],
		})),

	setSystemLogHeight: (height) =>
		set(() => ({
			systemLogHeight: height,
		})),

	setNewLogs: (isNewLogs) =>
		set(() => ({
			isNewLogs,
		})),

	setSystemLogNewItemsCount: (count) =>
		set((state) => ({
			systemLogNewItemsCount: typeof count === "function" ? count(state.systemLogNewItemsCount) : count,
		})),

	setSystemLogIsAtBottom: (isAtBottom) =>
		set(() => ({
			systemLogIsAtBottom: isAtBottom,
		})),

	setScrollToSystemLogBottom: (fn) =>
		set(() => ({
			scrollToSystemLogBottom: fn,
		})),
});

export const useLoggerStore = create(persist(store, { name: StoreName.logger }));
