import { t } from "i18next";
import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { DeploymentStateVariant, StoreName } from "@enums";
import { BuildsService, SessionsService } from "@services";
import { emptySelectItem } from "@src/constants/forms";
import { ManualRunStore } from "@src/interfaces/store";
import { convertBuildRuntimesToViewTriggers } from "@src/utilities";

import { useCacheStore, useToastStore } from "@store";

const defaultManualRunState = {
	files: [],
	filesSelectItems: [],
	filePath: emptySelectItem,
	entrypointFunction: emptySelectItem,
	params: "{}",
	isManualRunEnabled: false,
	isJson: false,
};

const store: StateCreator<ManualRunStore> = (set, get) => ({
	projectManualRun: {},
	isJson: true,

	fetchManualRunConfiguration: async (projectId: string) => {
		const { deployments } = useCacheStore.getState();
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

		const { data: buildDescription, error: buildDescriptionError } = await BuildsService.getBuildDescription(
			activeDeployment.buildId
		);

		if (buildDescriptionError || !buildDescription) {
			useToastStore.getState().addToast({
				message: t("history.buildInformationForSingleshotNotLoaded", { ns: "deployments" }),
				type: "error",
			});
			return;
		}

		const buildInfo = JSON.parse(buildDescription);
		const files = convertBuildRuntimesToViewTriggers(buildInfo.runtimes);

		get().updateManualRunConfiguration(projectId, {
			files,
			activeDeployment,
			isManualRunEnabled: true,
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
				projectData.filesSelectItems = filesSelectItems;

				const previousSelectedFileFunctionsArray = previousState?.filePath?.value
					? config.files[previousState.filePath.value]
					: [];
				const entrypointFromPreviousDeployment =
					previousSelectedFileFunctionsArray?.indexOf(previousState?.entrypointFunction?.value || "") !== -1;

				if (previousState?.entrypointFunction?.value && !entrypointFromPreviousDeployment) {
					projectData.filePath = filesSelectItems[0];
					projectData.entrypointFunction = emptySelectItem;
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
