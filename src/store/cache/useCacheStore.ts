import i18n from "i18next";
import { StateCreator, create } from "zustand";

import {
	DeploymentsService,
	EnvironmentsService,
	EventsService,
	LoggerService,
	TriggersService,
	VariablesService,
} from "@services";
import { namespaces } from "@src/constants";
import { DeploymentStateVariant } from "@src/enums";
import { CacheStore } from "@src/interfaces/store";
import { Environment } from "@src/types/models";

import { useToastStore } from "@store";

const initialState: Omit<CacheStore, "fetchDeployments" | "fetchTriggers" | "fetchVariables" | "fetchEvents"> = {
	loading: {
		deployments: false,
		triggers: false,
		variables: false,
		events: false,
	},
	deployments: undefined,
	hasActiveDeployments: false,
	variables: [],
	triggers: [],
	events: undefined,
	currentProjectId: undefined,
	envId: undefined,
};

const store: StateCreator<CacheStore> = (set, get) => ({
	...initialState,

	fetchDeployments: async (projectId, force) => {
		const { currentProjectId, deployments } = get();
		if (currentProjectId === projectId && !force) {
			return deployments;
		}

		set((state) => ({
			...state,
			loading: { ...state.loading, deployments: true },
		}));

		try {
			const { data: incomingDeployments, error } = await DeploymentsService.listByProjectId(projectId);

			if (error) {
				const errorMsg = i18n.t("errorFetchingDeployments", { ns: "errors" });

				useToastStore.getState().addToast({
					message: errorMsg,
					type: "error",
				});
			}

			set((state) => ({
				...state,
				deployments: incomingDeployments,
				hasActiveDeployments: incomingDeployments?.some((dep) => dep.state === DeploymentStateVariant.active),
				loading: { ...state.loading, deployments: false },
			}));

			return incomingDeployments;
		} catch (error) {
			const errorMsg = i18n.t("errorFetchingDeployments", { ns: "errors" });
			const errorLog = i18n.t("errorFetchingDeploymentsExtended", {
				ns: "errors",
				error: (error as Error).message,
			});
			useToastStore.getState().addToast({
				message: errorMsg,
				type: "error",
			});
			LoggerService.error(namespaces.stores.cache, errorLog);

			set((state) => ({ ...state, loading: { ...state.loading, deployments: false } }));
		}
	},

	fetchTriggers: async (projectId, force?) => {
		const { currentProjectId, triggers } = get();
		if (currentProjectId === projectId && triggers?.length && !force) {
			return triggers;
		}

		set((state) => ({
			...state,
			currentProjectId: projectId,
			loading: { ...state.loading, triggers: true },
		}));

		try {
			const { data: triggers, error } = await TriggersService.listByProjectId(projectId!);

			if (error) {
				throw error;
			}
			if (!triggers) {
				return;
			}

			set((state) => ({
				...state,
				triggers,
				loading: { ...state.loading, triggers: false },
			}));

			return triggers;
		} catch (error) {
			const errorMsg = i18n.t("errorFetchingTriggers", { ns: "errors" });
			const errorLog = i18n.t("errorFetchingTriggersExtended", {
				ns: "errors",
				error: (error as Error).message,
			});
			useToastStore.getState().addToast({
				message: errorMsg,
				type: "error",
			});
			LoggerService.error(namespaces.stores.cache, errorLog);

			set((state) => ({ ...state, loading: { ...state.loading, triggers: false } }));
		}
	},

	fetchEvents: async (force?: boolean) => {
		const { events } = get();
		if (events && !force) {
			return events;
		}

		set((state) => ({
			...state,
			loading: { ...state.loading, events: true },
		}));

		try {
			const { data: incomingEvents, error } = await EventsService.list();

			if (error) {
				const errorMsg = i18n.t("errorFetchingEvents", { ns: "errors" });

				useToastStore.getState().addToast({
					message: errorMsg,
					type: "error",
				});
			}

			set((state) => ({
				...state,
				events: incomingEvents,
				loading: { ...state.loading, events: false },
			}));

			return incomingEvents;
		} catch (error) {
			const errorMsg = i18n.t("errorFetchingEvents", { ns: "errors" });
			const errorLog = i18n.t("errorFetchingEventsExtended", {
				ns: "errors",
				error: (error as Error).message,
			});
			useToastStore.getState().addToast({
				message: errorMsg,
				type: "error",
			});
			LoggerService.error(namespaces.stores.cache, errorLog);

			set((state) => ({ ...state, loading: { ...state.loading, events: false } }));
		}
	},

	fetchVariables: async (projectId, force) => {
		const { currentProjectId, variables } = get();

		if (currentProjectId === projectId && !force && variables.length) {
			return variables;
		}

		set((state) => ({
			...state,
			currentProjectId: projectId,
			loading: { ...state.loading, variables: true },
		}));

		try {
			const { data: envs, error: errorEnvs } = await EnvironmentsService.listByProjectId(projectId);
			if (errorEnvs) {
				throw errorEnvs;
			}

			const newEnvId = (envs as Environment[])[0].envId;
			const { data: vars, error } = await VariablesService.list(newEnvId);
			if (error) {
				throw error;
			}

			set((state) => ({
				...state,
				envId: newEnvId,
				variables: vars,
				loading: { ...state.loading, variables: false },
			}));

			return vars;
		} catch (error) {
			const errorMsg = i18n.t("errorFetchingVariables", { ns: "errors" });
			const errorLog = i18n.t("errorFetchingVariablesExtended", {
				ns: "errors",
				error: (error as Error).message,
			});
			useToastStore.getState().addToast({
				message: errorMsg,
				type: "error",
			});
			LoggerService.error(namespaces.stores.cache, errorLog);

			set((state) => ({ ...state, loading: { ...state.loading, variables: false } }));
		}
	},
});

export const useCacheStore = create<CacheStore>(store);
