import i18n from "i18next";
import { StateCreator, create } from "zustand";

import { ProjectValidationLevel, ProjectValidationStore } from "@interfaces/store";
import { ConnectionService, ProjectsService, TriggersService } from "@services/index";

const defaultProjectValidationState = {
	code: {
		message: "",
		level: "warning" as ProjectValidationLevel,
	},
	connections: {
		message: "",
		level: "warning" as ProjectValidationLevel,
	},
	triggers: {
		message: "",
		level: "warning" as ProjectValidationLevel,
	},
	variables: {
		message: "",
		level: "warning" as ProjectValidationLevel,
	},
};

const store: StateCreator<ProjectValidationStore> = (set, get) => ({
	currentProjectId: "",
	projectValidationState: defaultProjectValidationState,
	isValid: false,
	checkState: async (projectId, enforce = false) => {
		if (projectId === get().currentProjectId && !enforce) {
			return;
		}

		set((state) => ({ ...state, isValid: false }));
		const newProjectValidationState = { ...defaultProjectValidationState };

		const { data: resources } = await ProjectsService.getResources(projectId);
		if (!resources || JSON.stringify(resources) === JSON.stringify({})) {
			newProjectValidationState.code = {
				message: i18n.t("validation.noCodeAndAssets", { ns: "tabs" }),
				level: "error",
			};
		}

		const { data: connections } = await ConnectionService.listByProjectId(projectId);
		const notInitiatedConnections = connections?.filter((connection) => connection.status !== "ok")?.length;
		if (notInitiatedConnections) {
			newProjectValidationState.connections = {
				...newProjectValidationState.connections,
				message: i18n.t("validation.connectionsNotConfigured", { ns: "tabs" }),
			};
		}

		const { data: triggers } = await TriggersService.listByProjectId(projectId);
		if (!triggers || !triggers.length) {
			newProjectValidationState.triggers = {
				...newProjectValidationState.triggers,
				message: i18n.t("validation.noTriggers", { ns: "tabs" }),
			};
		}

		const isInvalid = Object.values(newProjectValidationState).filter(
			(error) => !!error.message && error.level === "error"
		).length;

		set((state) => ({
			...state,
			projectValidationState: {
				...newProjectValidationState,
			},
			currentProjectId: projectId,
			isValid: !isInvalid,
		}));

		return;
	},
});

export const useProjectValidationStore = create(store);
