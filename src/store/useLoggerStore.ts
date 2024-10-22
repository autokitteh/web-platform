import randomatic from "randomatic";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

import { maxLogs } from "@constants";
import { StoreName } from "@enums";
import { LoggerStore } from "@interfaces/store";

const store: StateCreator<LoggerStore> = (set) => ({
	logs: [],
	isLoggerEnabled: false,
	isNewLogs: false,
	addLog: (log) =>
		set((state) => {
			const newLog = { ...log, id: randomatic("Aa0", 5) };
			const updatedLogs = [newLog, ...state.logs];
			if (updatedLogs.length > maxLogs) {
				updatedLogs.splice(maxLogs);
			}

			const shouldDisplayNotification = log.status === "ERROR" || log.status === "WARNING";

			return { logs: updatedLogs, isNewLogs: !state.isLoggerEnabled && shouldDisplayNotification };
		}),
	clearLogs: () =>
		set(() => ({
			logs: [],
		})),
	toggleLogger: (enabled) =>
		set(() => ({
			isLoggerEnabled: enabled,
			isNewLogs: false,
		})),
});

export const useLoggerStore = create(persist(store, { name: StoreName.logger }));
