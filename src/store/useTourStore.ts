import { t } from "i18next";
import { dump } from "js-yaml";
import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { StoreName, EventListenerName } from "@enums";
import { tourStorage } from "@services/indexedDB/tourIndexedDb.service";
import { LoggerService } from "@services/logger.service";
import { defaultOpenedProjectFile, namespaces } from "@src/constants";
import { tours } from "@src/constants/tour.constants";
import { createFileOperations } from "@src/factories";
import { TourStore, TourProgress } from "@src/interfaces/store";
import { parseTemplateManifestAndFiles } from "@src/utilities";

import { triggerEvent } from "@hooks";
import { useProjectStore } from "@store";

const defaultState = {
	activeTour: null as TourProgress | null,
	completedTours: [] as string[],
	pausedTours: {} as Record<string, number | undefined>,
};

const store: StateCreator<TourStore> = (set, get) => ({
	...defaultState,

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

		LoggerService.info(
			namespaces.tourStore,
			t("actions.projectCreatedSuccessfullyExtended", {
				templateName: tourId,
				projectId: newProjectId,
				ns: "dashboard",
			})
		);

		createFileOperations(newProjectId).saveAllFiles(
			Object.fromEntries(
				Object.entries(files).map(([path, content]) => [
					path,
					new Uint8Array(new TextEncoder().encode(content.toString())),
				])
			),
			newProjectId
		);

		getProjectsList();

		set((state) => ({
			...state,
			activeTour: {
				tourId,
				currentStepIndex: 0,
			},
		}));

		return { projectId: newProjectId, defaultFile: tours[tourId].defaultFile || defaultOpenedProjectFile };
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
		triggerEvent(EventListenerName.showToursProgress);
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
