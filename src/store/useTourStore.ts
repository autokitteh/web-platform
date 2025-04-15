import { t } from "i18next";
import { dump } from "js-yaml";
import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn as create } from "zustand/traditional";

import { StoreName, EventListenerName } from "@enums";
import { tourStorage } from "@services/indexedDB/tourIndexedDb.service";
import { LoggerService } from "@services/logger.service";
import { defaultOpenedProjectFile, namespaces } from "@src/constants";
import { emptyTourStep, tours } from "@src/constants/tour.constants";
import { ModalName } from "@src/enums/components";
import { fileOperations } from "@src/factories";
import { TourStore, TourProgress, TourStep } from "@src/interfaces/store";
import { cleanupAllHighlights, parseTemplateManifestAndFiles } from "@src/utilities";

import { triggerEvent } from "@hooks";
import { useModalStore, useProjectStore, useTemplatesStore } from "@store";

const defaultState = {
	activeTour: { tourId: "", currentStepIndex: 0 } as TourProgress,
	activeStep: { ...emptyTourStep } as TourStep,
	completedTours: [] as string[],
	canceledTours: [] as string[],
	isPopoverVisible: false,
	setPopoverVisible: () => {},
	lastStepUrl: undefined,
};

const store: StateCreator<TourStore> = (set, get) => ({
	...defaultState,
	fetchTours: async () => {
		const { fetchTemplates } = useTemplatesStore.getState();
		const localStorageTours = (await tourStorage.getAllRecords()) || {};
		if (Object.keys(localStorageTours)?.length > 0) {
			return;
		}
		fetchTemplates();
	},
	startTour: async (tourId) => {
		const { activeTour, reset } = get();
		const { createProjectFromManifest, getProjectsList } = useProjectStore.getState();

		if (activeTour && activeTour.tourId === tourId) {
			reset();
		}
		const templateData = await parseTemplateManifestAndFiles(tourId, tourStorage, tourId);

		if (!templateData) {
			return;
		}
		const { manifest, files } = templateData;

		const updatedManifestData = dump(manifest);

		const { data: newProjectId, error } = await createProjectFromManifest(updatedManifestData);

		if (error || !newProjectId) {
			LoggerService.error(
				namespaces.tourStore,
				t("projectCreationFailedExtended", {
					error: error || t("unknownError", { ns: "dashboard.tours" }),
					ns: "dashboard.tours",
				})
			);

			return;
		}

		fileOperations(newProjectId).saveAllFiles(
			Object.fromEntries(
				Object.entries(files).map(([path, content]) => [
					path,
					new Uint8Array(new TextEncoder().encode(content.toString())),
				])
			),
			newProjectId
		);

		LoggerService.info(
			namespaces.tourStore,
			t("actions.projectCreatedSuccessfullyExtended", {
				templateName: tourId,
				projectId: newProjectId,
				ns: "dashboard",
			})
		);

		getProjectsList();

		set((state) => ({
			...state,
			isPopoverVisible: true,
			activeTour: {
				tourId,
				currentStepIndex: 0,
			},
			activeStep: tours[tourId].steps[0],
		}));

		return { projectId: newProjectId, defaultFile: tours[tourId].defaultFile || defaultOpenedProjectFile };
	},

	setPopoverVisible: (visible) => set({ isPopoverVisible: visible }),

	setLastStepUrl: (url) => set({ lastStepUrl: url }),

	reset: () => set(defaultState),

	nextStep: () => {
		const { openModal } = useModalStore.getState();
		const { activeTour } = get();
		if (!activeTour) return;

		const tourConfig = tours[activeTour.tourId];
		if (!tourConfig) return;

		const totalSteps = tourConfig.steps.length;
		const nextStepIndex = activeTour.currentStepIndex + 1;

		if (nextStepIndex === totalSteps) {
			set((state) => ({
				...state,
				isPopoverVisible: false,
				activeTour: { ...defaultState.activeTour },
				activeStep: { ...defaultState.activeStep },
				lastStepUrl: undefined,
				completedTours: [...state.completedTours, activeTour.tourId],
			}));
			openModal(ModalName.toursProgress);
			triggerEvent(EventListenerName.clearTourStepListener);
			return;
		}

		set((state) => ({
			...state,
			activeTour: {
				...activeTour,
				currentStepIndex: nextStepIndex,
			},
			activeStep: tourConfig.steps[nextStepIndex],
		}));
	},

	prevStep: () => {
		const { activeTour } = get();
		if (!activeTour) return;
		const tourConfig = tours[activeTour.tourId];

		set((state) => ({
			...state,
			activeTour: {
				...state.activeTour!,
				currentStepIndex: Math.max(0, activeTour.currentStepIndex - 1),
			},
			activeStep: tourConfig.steps[activeTour.currentStepIndex - 1],
		}));
	},

	skipTour: () => {
		const { activeTour } = get();
		if (!activeTour) return;

		set((state) => ({
			...defaultState,
			activeStep: { ...defaultState.activeStep },
			activeTour: { ...defaultState.activeTour },
			lastStepUrl: undefined,
			isPopoverVisible: false,
			canceledTours: [...state.canceledTours, activeTour.tourId],
		}));
		triggerEvent(EventListenerName.clearTourStepListener);
		triggerEvent(EventListenerName.showToursProgress);
		cleanupAllHighlights();
	},
});

// This ensures that when we retrieve activeStep from storage,
// we get the correct step object from tours with all properties intact
const customStateHydration = (persistedState: any): any => {
	const state = persistedState;
	if (state.activeTour && state.activeTour.tourId && state.activeTour.currentStepIndex !== undefined) {
		const tourId = state.activeTour.tourId;
		const stepIndex = state.activeTour.currentStepIndex;
		const tourConfig = tours[tourId];

		// If we have a valid tour and step index, use the object from tours which has proper RegExp objects
		if (tourConfig && tourConfig.steps && tourConfig.steps[stepIndex]) {
			state.activeStep = tourConfig.steps[stepIndex];
		}
	}
	return state;
};

export const useTourStore = create(
	persist(immer(store), {
		name: StoreName.tour,
		version: 2,
		onRehydrateStorage: () => (state) => {
			if (state) {
				// Apply custom hydration to ensure RegExp objects are properly restored
				const hydratedState = customStateHydration(state);
				Object.assign(state, hydratedState);
			}
		},
	})
);
