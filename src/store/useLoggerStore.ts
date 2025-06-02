import randomatic from "randomatic";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

import { maxLogs } from "@constants";
import { StoreName } from "@enums";
import { LoggerStore } from "@interfaces/store";

const store: StateCreator<LoggerStore> = (set) => ({
	logs: [],
	isNewLogs: false,
	systemLogHeight: 0,

	addLog: (log) => {
		const newLog = { ...log, id: randomatic("Aa0", 5) };
		set((state) => {
			const updatedLogs = [...state.logs, newLog];
			if (updatedLogs.length > maxLogs) {
				updatedLogs.splice(maxLogs);
			}

			const shouldDisplayNotification = log.status === "ERROR" || log.status === "WARNING";

			return {
				logs: updatedLogs,
				isNewLogs: state.systemLogHeight < 1 && shouldDisplayNotification,
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
			isNewLogs: false,
		})),
});

export const useLoggerStore = create(
	persist(store, {
		name: StoreName.logger,
		version: 2,
		onRehydrateStorage: () => (state) => state,
		migrate: (persistedState, version) => {
			const state = persistedState as any;
			if (version < 2) {
				return {
					...state,
					logs: Array.isArray(state.logs) ? [...state.logs].reverse() : [],
				};
			}
			return state;
		},
	})
);
