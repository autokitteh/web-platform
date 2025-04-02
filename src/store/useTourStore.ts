import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { StoreName, EventListenerName } from "@enums";
import { tours } from "@src/constants/tour.constants";
import { TourStore, TourProgress } from "@src/interfaces/store";

import { triggerEvent } from "@hooks";

const defaultState = {
	activeTour: null as TourProgress | null,
	completedTours: [] as string[],
	pausedTours: {} as Record<string, number | undefined>,
};

const store: StateCreator<TourStore> = (set, get) => ({
	...defaultState,

	startTour: (tourId) => {
		const { activeTour } = get();
		if (!activeTour || activeTour.tourId !== tourId) {
			set((state) => ({
				...state,
				activeTour: {
					tourId,
					currentStepIndex: 0,
				},
			}));
			return;
		}
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
			}));
			triggerEvent(EventListenerName.clearTourHighlight);

			return;
		}
		set((state) => ({
			...state,
			activeTour: {
				...activeTour,
				currentStepIndex: nextStepIndex,
			},
		}));
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
		const { activeTour } = get();
		if (!activeTour) return;

		set((state) => ({
			...state,
			activeTour: null,
			completedTours: [...state.completedTours, activeTour.tourId],
		}));
	},

	markActiveAsCompleted: () => {
		const { activeTour } = get();
		if (!activeTour) return;

		set((state) => ({
			...state,
			activeTour: null,
			completedTours: [...state.completedTours, activeTour.tourId],
		}));
	},

	hasTourBeenCompleted: (tourId) => get().completedTours.includes(tourId),

	reset: () => set(defaultState),
});

export const useTourStore = create(
	persist(immer(store), {
		name: StoreName.tour,
		version: 1,
	}),
	shallow
);
