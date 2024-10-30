import i18n from "i18next";
import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { StoreName } from "@enums";
import { SessionsService } from "@services";
import { ManualProjectData, ManualRunStore } from "@src/interfaces/store";

const createDefaultProjectState = (): ManualProjectData => ({
	files: [],
	fileOptions: [],
	filePath: { label: "", value: "" },
	entrypointFunction: "",
	params: [],
	isManualRunEnabled: false,
	isJson: false,
});

const createFileOptions = (files: string[]): { label: string; value: string }[] =>
	files.map((file) => ({
		label: file,
		value: file,
	}));

const store: StateCreator<ManualRunStore> = (set, get) => ({
	projectManualRun: {},

	updateManualRunConfiguration: (
		projectId,
		{ entrypointFunction, filePath, files, isJson, isManualRunEnabled, lastDeployment, params }
	) => {
		set((state) => {
			const projectData = {
				...createDefaultProjectState(),
				...state.projectManualRun[projectId],
			};

			if (files) {
				const fileOptions = createFileOptions(files);
				Object.assign(projectData, {
					files,
					fileOptions,
					filePath: fileOptions[0],
					entrypointFunction: "",
					params: [],
				});
			}

			Object.assign(projectData, {
				...(isManualRunEnabled !== undefined && { isManualRunEnabled }),
				...(filePath && { filePath }),
				...(entrypointFunction !== undefined && { entrypointFunction }),
				...(params && { params: [...params] }),
				...(lastDeployment && { lastDeployment }),
				...(isJson !== undefined && { isJson }),
			});

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

		const actualParams = params || project.params || [];
		const jsonInputs = actualParams.reduce(
			(acc, { key, value }) => ({
				...acc,
				[key]: `"${value}"`,
			}),
			{}
		);

		const sessionArgs = {
			buildId: project.lastDeployment.buildId,
			deploymentId: project.lastDeployment.deploymentId,
			entrypoint: {
				col: 0,
				row: 0,
				path: project.filePath.value,
				name: project.entrypointFunction,
			},
			jsonInputs,
		};

		const { data: sessionId, error } = await SessionsService.startSession(sessionArgs, projectId);

		if (error) {
			return { data: undefined, error };
		}

		if (params?.length) {
			set((state) => {
				state.projectManualRun[projectId] = {
					...project,
					params: [...params],
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
