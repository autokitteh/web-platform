import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { StoreName } from "@enums";
import { TourStore } from "@src/interfaces/store";

const defaultState = {
	activeTourId: null,
	activeStepIndex: 0,
	completedTours: [],
	pausedTours: {},
};

const store: StateCreator<TourStore> = (set, get) => ({
	...defaultState,

	startTour: (tourId) => {
		const pausedTourStep = get().pausedTours[tourId];

		set((state) => ({
			...state,
			activeTourId: tourId,
			activeStepIndex: pausedTourStep !== undefined ? pausedTourStep : 0,
		}));
	},

	nextStep: (totalSteps) => {
		const { activeTourId, activeStepIndex } = get();

		if (activeStepIndex + 1 >= totalSteps) {
			set((state) => ({
				...state,
				activeTourId: null,
				activeStepIndex: 0,
				completedTours: activeTourId ? [...state.completedTours, activeTourId] : state.completedTours,
				pausedTours: {
					...state.pausedTours,
					[activeTourId!]: undefined,
				},
			}));
		} else {
			// Next step
			set((state) => ({
				...state,
				activeStepIndex: state.activeStepIndex + 1,
			}));
		}
	},

	prevStep: () => {
		set((state) => ({
			...state,
			activeStepIndex: Math.max(0, state.activeStepIndex - 1),
		}));
	},

	skipTour: () => {
		set((state) => ({
			...state,
			activeTourId: null,
			activeStepIndex: 0,
		}));
	},

	pauseTour: () => {
		const { activeTourId, activeStepIndex } = get();

		if (!activeTourId) return;

		set((state) => ({
			...state,
			pausedTours: {
				...state.pausedTours,
				[activeTourId]: activeStepIndex,
			},
			activeTourId: null,
		}));
	},

	hasTourBeenCompleted: (tourId) => {
		return get().completedTours.includes(tourId);
	},

	resetTours: () => set(defaultState),
});

export const useTourStore = create(
	persist(immer(store), {
		name: StoreName.tour,
		version: 1,
	}),
	shallow
);
