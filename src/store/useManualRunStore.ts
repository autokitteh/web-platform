import i18n from "i18next";
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
	fileOptions: [],
	filePath: emptySelectItem,
	entrypointFunction: emptySelectItem,
	params: [],
	isManualRunEnabled: false,
	isJson: false,
};

const store: StateCreator<ManualRunStore> = (set, get) => ({
	projectManualRun: {},

	fetchManualRunConfiguration: async (projectId: string) => {
		const deployments = useCacheStore.getState().deployments;
		const activeDeployment = deployments?.find((deployment) => deployment.state === DeploymentStateVariant.active);

		if (!deployments?.length || !activeDeployment) {
			get().updateManualRunConfiguration(projectId!, { isManualRunEnabled: false });

			return;
		}
		if (activeDeployment.buildId === get().projectManualRun[projectId]?.activeDeployment?.buildId) {
			get().updateManualRunConfiguration(projectId!, { isManualRunEnabled: true });

			return;
		}

		const { data: buildDescription, error: buildDescriptionError } = await BuildsService.getBuildDescription(
			activeDeployment.buildId
		);

		if (buildDescriptionError) {
			useToastStore.getState().addToast({
				message: i18n.t("history.buildInformationForSingleshotNotLoaded", { ns: "deployments" }),
				type: "error",
			});

			return;
		}
		const buildInfo = JSON.parse(buildDescription!);
		const files = convertBuildRuntimesToViewTriggers(buildInfo.runtimes);

		get().updateManualRunConfiguration(projectId!, {
			files,
			activeDeployment,
			isManualRunEnabled: true,
		});
	},

	updateManualRunConfiguration: (
		projectId,
		{ activeDeployment, entrypointFunction, filePath, files, isJson, isManualRunEnabled, params }
	) => {
		const previousProjectManualRunState = get().projectManualRun[projectId];
		set((state) => {
			const projectData = {
				...defaultManualRunState,
				...state.projectManualRun[projectId],
			};
			if (files) {
				const fileOptions = Object.keys(files).map((file) => ({
					label: file,
					value: file,
				}));

				projectData.files = files;
				projectData.fileOptions = fileOptions;

				const { filePath: prevFilePath, entrypointFunction: prevEntrypointFunction } =
					previousProjectManualRunState || {};
				const fileExists = prevFilePath?.value && files?.[prevFilePath.value];
				const entrypointExists = fileExists?.includes(prevEntrypointFunction?.value);

				if (!entrypointExists) {
					Object.assign(projectData, { filePath: fileOptions[0], entrypointFunction: emptySelectItem });
				}
			}

			Object.assign(projectData, {
				...(isManualRunEnabled !== undefined && { isManualRunEnabled }),
				...(filePath && { filePath }),
				...(entrypointFunction !== undefined && { entrypointFunction }),
				...(params && { params: [...params] }),
				...(activeDeployment && { activeDeployment }),
				...(isJson !== undefined && { isJson }),
			});

			state.projectManualRun[projectId] = projectData;

			return state;
		});
	},

	saveAndExecuteManualRun: async (projectId, params) => {
		const project = get().projectManualRun[projectId];

		if (!project?.activeDeployment) {
			return {
				data: undefined,
				error: i18n.t("history.manualRun.missingactiveDeployment", { ns: "deployments" }),
			};
		}

		const actualParams = params || project.params;

		const sessionArgs = {
			buildId: project.activeDeployment.buildId,
			deploymentId: project.activeDeployment.deploymentId,
			entrypoint: {
				col: 0,
				row: 0,
				path: project.filePath.value,
				name: project.entrypointFunction.value,
			},
			jsonInputs: actualParams,
		};

		const { data: sessionId, error } = await SessionsService.startSession(sessionArgs, projectId);

		if (error) {
			return { data: undefined, error };
		}

		if (params?.length) {
			set((state) => {
				state.projectManualRun[projectId] = {
					...project,
					params: params,
				};

				return state;
			});
		}

		return { data: sessionId, error: undefined };
	},
});

export const useManualRunStore = create(
	persist(immer(store), {
		name: StoreName.manualRun,
		version: 1,
		migrate: () => ({}),
	}),
	shallow
);
