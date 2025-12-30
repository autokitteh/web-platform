import i18n, { t } from "i18next";
import { dump } from "js-yaml";
import randomatic from "randomatic";
import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn as create } from "zustand/traditional";

import { StoreName, EventListenerName, TourId } from "@enums";
import { tourStorage } from "@services/indexedDB";
import { LoggerService } from "@services/logger.service";
import { defaultOpenedProjectFile, defaultProjectName, namespaces } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { fileOperations } from "@src/factories";
import { TourStore, TourProgress, Tour } from "@src/interfaces/store";
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
	isToursReady: false,
	tours: {} as Record<string, Tour>,
} as TourStore;

const store: StateCreator<TourStore> = (set, get) => ({
	...defaultState,
	startTour: async (tourId) => {
		const { activeTour, reset, tours: storeTours } = get();
		const { createProjectFromManifest, getProjectsList, isProjectNameTaken } = useProjectStore.getState();

		const tourConfig = storeTours[tourId];
		if (!tourConfig) {
			LoggerService.error(namespaces.tourStore, t("tours.tourConfigNotFound", { tourId, ns: "dashboard" }));
			return { data: undefined, error: true };
		}

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
		const manifestProject = (manifest as { project?: { connections?: any[]; name?: string } }).project;
		const tourProjectName = manifestProject?.name || defaultProjectName;

		const isProjectNameExist = isProjectNameTaken(tourProjectName);
		const projectName = isProjectNameExist ? tourProjectName + randomatic("Aa", 4) : tourProjectName;
		const updatedManifestData = dump({
			...manifest,
			project: {
				name: projectName,
				connections: manifestProject?.connections || [],
			},
		});

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

		// Re-fetch tourConfig to ensure we have the latest version (tours might be loaded asynchronously)
		const currentTourConfig = get().tours[tourId];
		if (!currentTourConfig || !currentTourConfig.steps || currentTourConfig.steps.length === 0) {
			LoggerService.error(
				namespaces.tourStore,
				t("tours.tourConfigInvalid", { tourId, ns: "dashboard" }) ||
					`Tour config for ${tourId} is invalid or has no steps`,
				true
			);
			return { data: undefined, error: true };
		}

		set((state) => ({
			...state,
			isPopoverVisible: true,
			tourProjectId: newProjectId,
			activeTour: {
				tourId,
				currentStepIndex: 0,
			},
			activeStep: currentTourConfig.steps[0],
		}));

		return {
			data: { projectId: newProjectId, defaultFile: currentTourConfig.defaultFile || defaultOpenedProjectFile },
			error: false,
		};
	},

	setPopoverVisible: (visible) => set({ isPopoverVisible: visible }),

	setToursReady: (toursData) => set({ isToursReady: true, tours: toursData }),

	getLastStepUrl: () => get().lastStepUrls[get().lastStepUrls.length - 1],

	reset: () => {
		const { isToursReady, tours } = get();
		set({
			...defaultState,
			// Preserve tours initialization state - these should not be reset
			isToursReady,
			tours,
		});
	},

	nextStep: (currentStepUrl: string) => {
		const { activeTour, tours: storeTours } = get();
		if (!activeTour) return;

		const { tourId } = activeTour;

		const tourConfig = storeTours[tourId];
		if (!tourConfig || !tourConfig.steps || tourConfig.steps.length === 0) {
			LoggerService.error(
				namespaces.tourStore,
				`Tour config for ${tourId} is invalid or has no steps in nextStep`,
				true
			);
			return;
		}

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
		const { activeTour, tours: storeTours } = get();
		if (!activeTour) return;
		const tourConfig = storeTours[activeTour.tourId];

		if (!tourConfig || !tourConfig.steps || tourConfig.steps.length === 0) {
			LoggerService.error(
				namespaces.tourStore,
				`Tour config for ${activeTour.tourId} is invalid or has no steps in prevStep`,
				true
			);
			return;
		}

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
		const { reset } = get();
		openModal(ModalName.toursProgress);
		triggerEvent(EventListenerName.clearTourStepListener);
		triggerEvent(EventListenerName.showToursProgress);
		cleanupAllHighlights();
		const { activeTour } = get();
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

	isOnActiveTourPage: (tourId, projectId) => {
		const { activeTour, tourProjectId } = get();

		const isTourMatch = activeTour?.tourId === tourId;
		const isProjectMatch = projectId ? tourProjectId === projectId : true;

		return isTourMatch && isProjectMatch;
	},
});

const customStateHydration = (persistedState: any, storeTours: Record<string, Tour>): any => {
	const state = persistedState;
	if (state.activeTour && state.activeTour.tourId && state.activeTour.currentStepIndex !== undefined) {
		const tourId = state.activeTour.tourId;
		const stepIndex = state.activeTour.currentStepIndex;
		const tourConfig = storeTours[tourId];

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
			isToursReady: state.isToursReady,
			tours: state.tours,
		}),
		onRehydrateStorage: () => (state) => {
			if (state && state.tours && Object.keys(state.tours).length > 0) {
				const hydratedState = customStateHydration(state, state.tours);
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

const waitForTours = async (maxRetries = 20, delayMs = 100): Promise<Record<string, Tour>> => {
	const module = await import("@src/constants/tour.constants");
	for (let i = 0; i < maxRetries; i++) {
		if (Object.keys(module.tours).length > 0) {
			return module.tours;
		}
		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}
	// Return whatever we have, even if empty - initializeTours will handle it
	return module.tours;
};

const initializeTours = async () => {
	try {
		const state = useTourStore.getState();
		// If tours are already loaded and not empty, skip re-initialization
		if (state.isToursReady && Object.keys(state.tours).length > 0) {
			LoggerService.info(namespaces.tourStore, "Tours already initialized, skipping", true);
			return;
		}

		const tours = await waitForTours();
		const toursCount = Object.keys(tours).length;

		// Always set isToursReady to true, even if tours is empty, to prevent infinite loading
		// The component can check tours.length if needed
		state.setToursReady(toursCount > 0 ? tours : {});

		if (toursCount === 0) {
			LoggerService.warn(
				namespaces.tourStore,
				"No tours found after initialization - tours may still be loading",
				true
			);
		} else {
			LoggerService.info(namespaces.tourStore, `Successfully initialized ${toursCount} tour(s)`, true);
		}

		const updatedState = useTourStore.getState();
		if (updatedState.activeTour?.tourId && updatedState.activeTour?.currentStepIndex !== undefined) {
			const tourConfig = tours[updatedState.activeTour.tourId];
			if (tourConfig?.steps?.[updatedState.activeTour.currentStepIndex]) {
				useTourStore.setState({ activeStep: tourConfig.steps[updatedState.activeTour.currentStepIndex] });
			}
		}
	} catch (error) {
		LoggerService.error(
			namespaces.tourStore,
			`Failed to initialize tours: ${error instanceof Error ? error.message : String(error)}`,
			true
		);
		// Set isToursReady to true anyway to prevent infinite loading
		const state = useTourStore.getState();
		state.setToursReady({});
	}
};

if (i18n.isInitialized) {
	initializeTours();
} else {
	i18n.on("initialized", initializeTours);
}
