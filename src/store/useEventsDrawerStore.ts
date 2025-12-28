import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { createWithEqualityFn as create } from "zustand/traditional";

import { EventsDrawerStore } from "@interfaces/store";

const initialState = {
	connectionId: undefined,
	projectId: undefined,
	triggerId: undefined,
	selectedEventId: undefined,
	section: undefined,
};

const store: StateCreator<EventsDrawerStore> = (set) => ({
	...initialState,
	setState: (newState) =>
		set((current) => ({
			...current,
			...newState,
		})),
	resetState: () => set(initialState),
	setSelectedEventId: (selectedEventId) =>
		set((current) => ({
			...current,
			selectedEventId,
		})),
});

export const useEventsDrawerStore = create<EventsDrawerStore>()(
	persist(store, {
		name: "events-drawer-store",
	})
);
