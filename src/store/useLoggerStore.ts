import { maxLogs } from "@constants";
import { StoreName } from "@enums";
import { LoggerStore } from "@interfaces/store";
import randomatic from "randomatic";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const store: StateCreator<LoggerStore> = (set) => ({
	logs: [],
	addLog: (log) =>
		set((state) => {
			const newLog = { ...log, id: randomatic("Aa0", 5) };
			const updatedLogs = [newLog, ...state.logs];
			if (updatedLogs.length > maxLogs) updatedLogs.splice(maxLogs);

			return { logs: updatedLogs };
		}),
	clearLogs: () =>
		set(() => ({
			logs: [],
		})),
});

export const useLoggerStore = create(persist(store, { name: StoreName.logger }));
