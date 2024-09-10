import i18n from "i18next";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { SessionsService } from "@services";
import { ManualProjectData, ManualRunStore } from "@src/interfaces/store";

import { useToastStore } from "@store";

const defaultProjectState = {
	files: {},
	fileOptions: [],
	entrypointFunctions: [],
	filePath: { label: "", value: "" },
	entrypointFunction: { label: "", value: "" },
	params: [],
};

const updateFilePathAndEntrypointFunctions = (
	projectData: ManualProjectData,
	filePath: { label: string; value: string }
) => {
	const selectedFile = projectData.files[filePath.value];
	if (!selectedFile || !selectedFile.length) {
		const addToast = useToastStore.getState().addToast;

		addToast({
			id: Date.now().toString(),
			message: i18n.t("history.manualRun.filePathDoesNotExistExtended", {
				ns: "deployments",
				filePath: filePath.value,
			}),
			type: "error",
		});

		return;
	}

	projectData.filePath = filePath;

	projectData.entrypointFunctions = selectedFile.map((entry) => ({
		label: entry.name,
		value: entry.name,
	}));

	if (projectData.entrypointFunctions.length) {
		projectData.entrypointFunction = projectData.entrypointFunctions[0];
		projectData.selectedEntrypoint = selectedFile[0];
	}
};

const store: StateCreator<ManualRunStore> = (set, get) => ({
	projectManualRun: {},

	updateProjectManualRun: (projectId, { entrypointFunction, filePath, files, lastDeployment, params }) => {
		set((state) => {
			const projectData = state.projectManualRun[projectId] || { ...defaultProjectState };

			if (files) {
				const fileOptions = Object.keys(files).map((file) => ({
					label: file,
					value: file,
				}));

				projectData.fileOptions = fileOptions;
				projectData.files = files;

				const firstFile = fileOptions[0];
				updateFilePathAndEntrypointFunctions(projectData, firstFile);
			}

			if (filePath) {
				updateFilePathAndEntrypointFunctions(projectData, filePath);
			}

			if (entrypointFunction) {
				projectData.entrypointFunction = entrypointFunction;
				projectData.selectedEntrypoint = projectData.files[projectData.filePath.value]?.find(
					(entry) => entry.name === entrypointFunction.value
				);
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

		if (!project?.lastDeployment || !project?.selectedEntrypoint) {
			return { data: undefined, error: i18n.t("manualRun.missingDeploymentOrEntrypoint", { ns: "deployments" }) };
		}

		const actualParams = params || project?.params || [];

		const jsonInputs = actualParams.length
			? Object.fromEntries(actualParams.map(({ key, value }) => [key, `"${value}"`]))
			: {};

		const sessionArgs = {
			buildId: project.lastDeployment.buildId,
			deploymentId: project.lastDeployment.deploymentId,
			entrypoint: project.selectedEntrypoint,
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

export const useManualRunStore = create(persist(immer(store), { name: StoreName.manualRun }));
