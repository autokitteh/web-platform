import i18n from "i18next";
import { StateCreator, create } from "zustand";

import { ProjectValidationStore } from "@interfaces/store";
import { ConnectionService, ProjectsService, TriggersService } from "@services/index";

const store: StateCreator<ProjectValidationStore> = (set, get) => ({
	currentProjectId: "",
	projectValidationState: {
		code: "",
		connections: "",
		triggers: "",
		variables: "",
	},
	isValid: false,
	totalErrors: 0,
	checkState: async (projectId, enforce = false) => {
		if (projectId === get().currentProjectId && !enforce) {
			return;
		}

		set((state) => ({ ...state, isValid: false }));
		const newProjectValidationState = {
			code: "",
			connections: "",
			triggers: "",
			variables: "",
		};

		const { data: resources } = await ProjectsService.getResources(projectId);
		if (!resources || !Object.keys(resources).length) {
			newProjectValidationState.code = i18n.t("validation.noCodeAndAssets", { ns: "tabs" });
		}

		const { data: connections } = await ConnectionService.listByProjectId(projectId);
		const notInitiatedConnections = connections?.filter((connection) => connection.status !== "ok")?.length;
		if (notInitiatedConnections) {
			newProjectValidationState.code = i18n.t("validation.connectionsNotConfigured", { ns: "tabs" });
		}

		const { data: triggers } = await TriggersService.listByProjectId(projectId);
		if (!triggers || !triggers.length) {
			newProjectValidationState.triggers = i18n.t("validation.noTriggers", { ns: "tabs" });
		}

		const totalErrors = Object.values(newProjectValidationState).filter((error) => !!error).length;

		set((state) => ({
			...state,
			projectValidationState: {
				...newProjectValidationState,
			},
			currentProjectId: projectId,
			isValid: !totalErrors,
			totalErrors,
		}));

		return;
	},
});

export const useProjectValidationStore = create(store);
