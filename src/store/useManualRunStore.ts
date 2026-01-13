import { t } from "i18next";
import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { DeploymentStateVariant, StoreName } from "@enums";
import { SessionsService } from "@services";
import { emptySelectItem } from "@src/constants/forms";
import { tours } from "@src/constants/tour.constants";
import { ManualRunStore } from "@src/interfaces/store";

import { useBuildFilesStore, useCacheStore, useToastStore } from "@store";

const defaultManualRunState = {
	files: [],
	filesSelectItems: [],
	filePath: emptySelectItem,
	entrypointFunction: emptySelectItem,
	params: "{}",
	isManualRunEnabled: false,
	isJson: false,
	isDurable: false,
};

const store: StateCreator<ManualRunStore> = (set, get) => ({
	projectManualRun: {},
	isJson: true,

	fetchManualRunConfiguration: async (projectId, preSelectRunValuesTourId) => {
		const deployments = (await useCacheStore.getState().fetchDeployments(projectId, true)) || [];
		if (!deployments || !deployments.length) return;
		const activeDeployment = deployments?.find((deployment) => deployment.state === DeploymentStateVariant.active);

		if (!deployments?.length || !activeDeployment) {
			get().updateManualRunConfiguration(projectId, { isManualRunEnabled: false });
			return;
		}

		const currentProject = get().projectManualRun[projectId];
		if (activeDeployment.buildId === currentProject?.activeDeployment?.buildId) {
			get().updateManualRunConfiguration(projectId, { isManualRunEnabled: true });
			return;
		}

		const { data: files, error: buildFilesError } = await useBuildFilesStore
			.getState()
			.fetchBuildFiles(projectId, activeDeployment.buildId);

		if (buildFilesError || !files) {
			useToastStore.getState().addToast({
				message: t("history.buildInformationForSingleshotNotLoaded", { ns: "deployments" }),
				type: "error",
			});
			return;
		}

		if (!preSelectRunValuesTourId) {
			get().updateManualRunConfiguration(projectId, {
				files,
				activeDeployment,
				isManualRunEnabled: true,
			});
			return;
		}

		const convertToSelectItem = (value: string) => ({ label: value, value });

		const entrypoint = Object.values(tours).find((tour) => tour.id === preSelectRunValuesTourId);
		if (!entrypoint) return;

		const { entrypointFile, entrypointFunction } = entrypoint || {};

		get().updateManualRunConfiguration(projectId, {
			files,
			filesSelectItems: Object.keys(files).map(convertToSelectItem),
			activeDeployment,
			isManualRunEnabled: true,
			params: "{}",
			filePath: convertToSelectItem(entrypointFile),
			entrypointFunction: convertToSelectItem(entrypointFunction),
		});
	},

	setIsJson: (isJson) => {
		set({ isJson });
	},

	updateManualRunConfiguration: (projectId, config) => {
		const previousState = get().projectManualRun[projectId];
		set((state) => {
			const projectData = {
				...defaultManualRunState,
				...previousState,
				...config,
			};

			if (config.files) {
				const filesSelectItems = Object.keys(config.files).map((file) => ({ label: file, value: file }));

				if (!config.filesSelectItems) {
					projectData.filesSelectItems = filesSelectItems;
				}

				if (!config.filePath && !config.entrypointFunction) {
					const previousSelectedFileFunctionsArray = previousState?.filePath?.value
						? config.files[previousState.filePath.value]
						: [];
					const entrypointFromPreviousDeployment =
						previousSelectedFileFunctionsArray?.indexOf(previousState?.entrypointFunction?.value || "") !==
						-1;

					if (previousState?.entrypointFunction?.value && !entrypointFromPreviousDeployment) {
						projectData.filePath = filesSelectItems[0];
						projectData.entrypointFunction = emptySelectItem;
					}
				}
			}

			state.projectManualRun[projectId] = projectData;
			return state;
		});
	},

	saveAndExecuteManualRun: async (projectId) => {
		const project = get().projectManualRun[projectId];

		if (!project?.activeDeployment) {
			return {
				data: undefined,
				error: t("history.manualRun.missingActiveDeployment", { ns: "deployments" }),
			};
		}

		if (!project.filePath || !project.entrypointFunction) {
			return { data: undefined, error: t("history.manualRun.missingnEntrypoint", { ns: "deployments" }) };
		}

		const sessionArgs = {
			buildId: project.activeDeployment.buildId,
			deploymentId: project.activeDeployment.deploymentId,
			entrypoint: {
				col: 0,
				row: 0,
				path: project.filePath.value,
				name: project.entrypointFunction.value,
			},
			jsonInputs: project.params,
			isDurable: project?.isDurable,
		};

		const { data: sessionId, error } = await SessionsService.startSession(sessionArgs, projectId);

		if (error) {
			return { data: undefined, error };
		}

		return { data: sessionId, error: undefined };
	},
});

export const useManualRunStore = create(
	persist(immer(store), {
		name: StoreName.manualRun,
		version: 2,
		migrate: () => ({}),
	}),
	shallow
);
