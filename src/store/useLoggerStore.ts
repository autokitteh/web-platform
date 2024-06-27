import { StoreName } from "@enums";
import { LoggerStore } from "@interfaces/store";
import randomatic from "randomatic";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const store: StateCreator<LoggerStore> = (set) => ({
	logs: [],
	addLog: (log) =>
		set((state) => ({
			logs: [...state.logs, { ...log, id: randomatic("Aa0", 5) }],
		})),
	clearLogs: () =>
		set(() => ({
			logs: [],
		})),
});

export const useLoggerStore = create(persist(store, { name: StoreName.logger }));
