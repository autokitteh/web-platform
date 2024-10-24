import i18n from "i18next";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { SessionsService } from "@services";
import { ManualRunStore } from "@src/interfaces/store";

const defaultProjectState = {
	files: [],
	fileOptions: [],
	filePath: { label: "", value: "" },
	entrypointFunction: "",
	params: [],
	isManualRunEnabled: false,
	isJson: false,
};

const store: StateCreator<ManualRunStore> = (set, get) => ({
	projectManualRun: {},

	updateManualRunConfiguration: (
		projectId,
		{ entrypointFunction, filePath, files, isJson, isManualRunEnabled, lastDeployment, params }
	) => {
		set((state) => {
			const projectData = state.projectManualRun[projectId] || { ...defaultProjectState };

			if (isManualRunEnabled !== undefined) {
				projectData.isManualRunEnabled = isManualRunEnabled;
			}

			if (files) {
				projectData.files = files;

				const fileOptions = files.map((file) => ({
					label: file,
					value: file,
				}));

				projectData.fileOptions = fileOptions;

				const firstFile = fileOptions[0];
				projectData.filePath = firstFile;
				projectData.entrypointFunction = "";
				projectData.params = [];
			}

			if (filePath) {
				projectData.filePath = filePath;
				projectData.entrypointFunction = "";
			}

			if (entrypointFunction !== undefined) {
				projectData.entrypointFunction = entrypointFunction;
			}

			if (params) {
				projectData.params = [...params];
			}

			if (lastDeployment) {
				projectData.lastDeployment = lastDeployment;
			}

			if (isJson !== undefined) {
				projectData.isJson = isJson;
			}

			state.projectManualRun[projectId] = projectData;

			return state;
		});
	},

	saveAndExecuteManualRun: async (projectId, params) => {
		const project = get().projectManualRun[projectId];

		if (!project?.lastDeployment) {
			return {
				data: undefined,
				error: i18n.t("history.manualRun.missingLastDeployment", { ns: "deployments" }),
			};
		}

		const actualParams = params || project?.params || [];

		const jsonInputs = actualParams.length
			? Object.fromEntries(actualParams.map(({ key, value }) => [key, `"${value}"`]))
			: {};

		const sessionArgs = {
			buildId: project.lastDeployment.buildId,
			deploymentId: project.lastDeployment.deploymentId,
			entrypoint: { col: 0, row: 0, path: project.filePath.value, name: project.entrypointFunction },
			jsonInputs,
		};

		const { data: sessionId, error } = await SessionsService.startSession(sessionArgs, projectId);

		if (error) {
			return { data: undefined, error };
		}

		set((state) => {
			if (params?.length) {
				state.projectManualRun[projectId] = { ...project, params: [...params] };
			}

			return state;
		});

		return { data: sessionId, error: undefined };
	},
});

export const useManualRunStore = create(
	persist(immer(store), {
		name: StoreName.manualRun,
		version: 1,
		migrate: () => {
			return {};
		},
	})
);
