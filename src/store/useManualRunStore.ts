import i18n from "i18next";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { SessionsService } from "@services";
import { ManualRunStore } from "@src/interfaces/store";

const defaultProjectState = {
	files: {},
	fileOptions: [],
	filePath: { label: "", value: "" },
	entrypointFunction: "",
	params: [],
};

const store: StateCreator<ManualRunStore> = (set, get) => ({
	projectManualRun: {},

	updateProjectManualRun: (projectId, { entrypointFunction, filePath, files, lastDeployment, params }) => {
		set((state) => {
			const projectData = state.projectManualRun[projectId] || { ...defaultProjectState };
			if (files) {
				const filteredFiles = Object.fromEntries(
					Object.entries(files)
						.filter(([key]) => key !== "archive")
						.map(([key, value]) => [key, value.filter((entry) => !entry.name.startsWith("_"))])
				);

				const fileOptions = Object.keys(filteredFiles).map((file) => ({
					label: file,
					value: file,
				}));

				projectData.fileOptions = fileOptions;
				projectData.files = filteredFiles;

				const firstFile = fileOptions[0];
				projectData.filePath = firstFile;
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

			state.projectManualRun[projectId] = projectData;

			return state;
		});
	},

	saveProjectManualRun: async (projectId, params) => {
		const project = get().projectManualRun[projectId];

		if (!project?.lastDeployment || !project?.entrypointFunction) {
			return {
				data: undefined,
				error: i18n.t("history.manualRun.missingDeploymentOrEntrypoint", { ns: "deployments" }),
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

export const useManualRunStore = create(persist(immer(store), { name: StoreName.manualRun, version: 1 }));
