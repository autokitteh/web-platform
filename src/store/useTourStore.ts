import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { StoreName } from "@enums";
import { tours } from "@src/constants/tour.constants";
import { TourStore, TourProgress } from "@src/interfaces/store";

const defaultState = {
	activeTour: null as TourProgress | null,
	completedTours: [] as string[],
	pausedTours: {} as Record<string, number | undefined>,
};

const store: StateCreator<TourStore> = (set, get) => ({
	...defaultState,

	startTour: (tourId) => {
		const pausedTourStep = get().pausedTours[tourId];

		set((state) => ({
			...state,
			activeTour: {
				tourId,
				currentStepIndex: pausedTourStep !== undefined ? pausedTourStep : 0,
			},
		}));
	},

	nextStep: () => {
		const { activeTour } = get();
		if (!activeTour) return;

		const tourConfig = tours[activeTour.tourId];
		if (!tourConfig) return;

		const totalSteps = tourConfig.steps.length;
		const nextStepIndex = activeTour.currentStepIndex + 1;

		if (nextStepIndex >= totalSteps) {
			set((state) => ({
				...state,
				activeTour: null,
				completedTours: [...state.completedTours, activeTour.tourId],
				pausedTours: {
					...state.pausedTours,
					[activeTour.tourId]: undefined,
				},
			}));
		} else {
			set((state) => ({
				...state,
				activeTour: {
					...state.activeTour!,
					currentStepIndex: nextStepIndex,
				},
			}));
		}
	},

	prevStep: () => {
		const { activeTour } = get();
		if (!activeTour) return;

		set((state) => ({
			...state,
			activeTour: {
				...state.activeTour!,
				currentStepIndex: Math.max(0, activeTour.currentStepIndex - 1),
			},
		}));
	},

	skipTour: () => {
		set((state) => ({
			...state,
			activeTour: null,
		}));
	},

	pauseTour: () => {
		const { activeTour } = get();
		if (!activeTour) return;

		set((state) => ({
			...state,
			pausedTours: {
				...state.pausedTours,
				[activeTour.tourId]: activeTour.currentStepIndex,
			},
			activeTour: null,
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
