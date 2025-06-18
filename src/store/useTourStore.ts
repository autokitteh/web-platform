import { t } from "i18next";
import { dump } from "js-yaml";
import randomatic from "randomatic";
import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn as create } from "zustand/traditional";

import { StoreName, EventListenerName, TourId } from "@enums";
import { tourStorage } from "@services/indexedDB";
import { LoggerService } from "@services/logger.service";
import { defaultOpenedProjectFile, defaultProjectName, namespaces, tours } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { fileOperations } from "@src/factories";
import { TourStore, TourProgress } from "@src/interfaces/store";
import { cleanupAllHighlights, parseTemplateManifestAndFiles } from "@src/utilities";

import { triggerEvent } from "@hooks";
import { useModalStore, useProjectStore } from "@store";

const defaultState = {
	activeTour: { tourId: "" as TourId, currentStepIndex: 0 } as TourProgress,
	activeStep: undefined,
	completedTours: [] as string[],
	canceledTours: [] as string[],
	isPopoverVisible: false,
	lastStepUrls: [] as string[],
	lastStepIndex: undefined,
	tourProjectId: undefined,
} as TourStore;

const store: StateCreator<TourStore> = (set, get) => ({
	...defaultState,
	startTour: async (tourId) => {
		const { activeTour, reset } = get();
		const { createProjectFromManifest, getProjectsList, isProjectNameTaken } = useProjectStore.getState();

		if (activeTour && activeTour.tourId === tourId) reset();

		let templateData = await parseTemplateManifestAndFiles(tourId, tourStorage, tourId);

		if (templateData === null) {
			LoggerService.warn(
				namespaces.tourStore,
				`First attempt to parse template manifest failed, retrying once...`
			);

			templateData = await parseTemplateManifestAndFiles(tourId, tourStorage, tourId);
		}

		if (templateData === null) {
			LoggerService.error(
				namespaces.tourStore,
				t("actions.projectManifestNotFoundInArchive", { ns: "dashboard" })
			);
			return { data: undefined, error: true };
		}
		const { manifest, files } = templateData;

		const tourProjectName = (manifest as { project: { name?: string } }).project.name || defaultProjectName;

		const isProjectNameExist = isProjectNameTaken(tourProjectName);
		const projectName = isProjectNameExist ? tourProjectName + randomatic("Aa", 4) : tourProjectName;

		const updatedManifestData = dump({ ...manifest, project: { name: projectName } });

		const { data: newProjectId, error } = await createProjectFromManifest(updatedManifestData);
		if (error || !newProjectId) {
			LoggerService.error(
				namespaces.tourStore,
				t("actions.projectCreationFailedExtended", {
					error: error || t("tours.unknownError", { ns: "dashboard" }),
					ns: "dashboard",
				})
			);

			return { data: undefined, error: true };
		}

		await fileOperations(newProjectId).saveAllFiles(
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
			tourProjectId: newProjectId,
			activeTour: {
				tourId,
				currentStepIndex: 0,
			},
			activeStep: tours[tourId].steps[0],
		}));

		return {
			data: { projectId: newProjectId, defaultFile: tours[tourId].defaultFile || defaultOpenedProjectFile },
			error: false,
		};
	},

	setPopoverVisible: (visible) => set({ isPopoverVisible: visible }),

	getLastStepUrl: () => get().lastStepUrls[get().lastStepUrls.length - 1],

	reset: () => set(defaultState),

	nextStep: (currentStepUrl: string) => {
		const { activeTour } = get();
		if (!activeTour) return;

		const { tourId } = activeTour;

		const tourConfig = tours[tourId];
		if (!tourConfig) return;

		const totalSteps = tourConfig.steps.length;
		const nextStepIndex = activeTour.currentStepIndex + 1;

		if (nextStepIndex === totalSteps) {
			const { endTour } = get();
			endTour("complete");
			return;
		}

		set((state) => ({
			...state,
			activeTour: {
				...activeTour,
				currentStepIndex: nextStepIndex,
			},
			activeStep: tourConfig.steps[nextStepIndex],
			lastStepIndex: activeTour.currentStepIndex,
			lastStepUrls: [...state.lastStepUrls, currentStepUrl],
		}));
	},

	prevStep: () => {
		const { activeTour } = get();
		if (!activeTour) return;
		const tourConfig = tours[activeTour.tourId];

		const prevStep = Math.max(0, activeTour.currentStepIndex - 1);

		const previousUrl = get().getLastStepUrl();

		set((state) => ({
			...state,
			activeTour: {
				...state.activeTour!,
				currentStepIndex: prevStep,
			},
			activeStep: tourConfig.steps[prevStep],
			lastStepIndex: prevStep,
		}));

		if (previousUrl) {
			set((state) => ({ lastStepUrls: state.lastStepUrls.slice(0, -1) }));
			triggerEvent(EventListenerName.navigateToTourUrl, { url: previousUrl });
		}
	},

	endTour: (action) => {
		const { openModal } = useModalStore.getState();
		openModal(ModalName.toursProgress);
		triggerEvent(EventListenerName.clearTourStepListener);
		triggerEvent(EventListenerName.showToursProgress);
		cleanupAllHighlights();
		const { activeTour, reset } = get();
		const { tourId } = activeTour;

		reset();
		switch (action) {
			case "skip": {
				set((state) => ({
					canceledTours: [...state.canceledTours, tourId],
				}));
				break;
			}
			case "complete": {
				set((state) => ({
					completedTours: [...state.completedTours, tourId],
				}));
				break;
			}
		}
	},

	skipTour: () => {
		const { activeTour } = get();
		if (!activeTour?.tourId) return;
		const { endTour } = get();
		endTour("skip");
	},
});

const customStateHydration = (persistedState: any): any => {
	const state = persistedState;
	if (state.activeTour && state.activeTour.tourId && state.activeTour.currentStepIndex !== undefined) {
		const tourId = state.activeTour.tourId;
		const stepIndex = state.activeTour.currentStepIndex;
		const tourConfig = tours[tourId];

		if (tourConfig && tourConfig.steps && tourConfig.steps[stepIndex]) {
			state.activeStep = tourConfig.steps[stepIndex];
		}
	}
	return state;
};

export const useTourStore = create(
	persist(immer(store), {
		name: StoreName.tour,
		version: 2.2,
		partialize: (state) => ({
			activeTour: state.activeTour,
			activeStep: state.activeStep,
			completedTours: state.completedTours,
			canceledTours: state.canceledTours,
			lastStepUrls: state.lastStepUrls,
			tourProjectId: state.tourProjectId,
			lastStepIndex: state.lastStepIndex,
		}),
		onRehydrateStorage: () => (state) => {
			if (state) {
				const hydratedState = customStateHydration(state);
				Object.assign(state, hydratedState);
			}
		},
		migrate: (persistedState, version) => {
			if (version < 2.2) {
				return {
					...defaultState,
					completedTours: (persistedState as any)?.completedTours || [],
				};
			}
			return persistedState as any;
		},
	})
);
