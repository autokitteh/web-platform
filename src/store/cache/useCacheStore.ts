import i18n from "i18next";
import { StateCreator, create } from "zustand";

import {
	ConnectionService,
	DeploymentsService,
	EventsService,
	LoggerService,
	TriggersService,
	VariablesService,
} from "@services";
import { namespaces } from "@src/constants";
import { DeploymentStateVariant } from "@src/enums";
import { CacheStore, ProjectValidationLevel } from "@src/interfaces/store";

import { useToastStore } from "@store";

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

const initialState: Omit<
	CacheStore,
	| "fetchDeployments"
	| "fetchTriggers"
	| "fetchVariables"
	| "fetchEvents"
	| "fetchConnections"
	| "initCache"
	| "checkState"
> = {
	loading: {
		deployments: false,
		triggers: false,
		variables: false,
		events: false,
		connections: false,
	},
	deployments: undefined,
	hasActiveDeployments: false,
	variables: [],
	triggers: [],
	connections: undefined,
	events: undefined,
	currentProjectId: undefined,
	projectValidationState: defaultProjectValidationState,
	isValid: true,
};

const store: StateCreator<CacheStore> = (set, get) => ({
	...initialState,
	initCache: async (projectId, force = false) => {
		await Promise.all([
			get().fetchDeployments(projectId, force),
			get().fetchTriggers(projectId, force),
			get().fetchVariables(projectId, force),
			get().fetchConnections(projectId, force),
		]);
	},

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

			get().checkState(projectId!, { triggers });

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
			const { data: vars, error } = await VariablesService.listByScopeId(projectId);

			if (error) {
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
			}
			set((state) => ({
				...state,
				variables: vars,
				loading: { ...state.loading, variables: false },
			}));

			get().checkState(projectId!, { variables: vars });

			return vars;
		} catch (error) {
			const errorMsg = i18n.t("errorFetchingVariable", { ns: "errors" });
			const errorLog = i18n.t("errorFetchingVariableExtended", {
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

	fetchConnections: async (projectId, force) => {
		const { connections, currentProjectId } = get();

		if (currentProjectId === projectId && !force && connections) {
			return connections;
		}

		set((state) => ({
			...state,
			currentProjectId: projectId,
			loading: { ...state.loading, connections: true },
		}));

		try {
			const { data: connectionsResponse, error } = await ConnectionService.listByProjectId(projectId!);

			if (error) {
				throw error;
			}

			set((state) => ({
				...state,
				connections: connectionsResponse,
				loading: { ...state.loading, connections: false },
			}));

			get().checkState(projectId!, { connections: connectionsResponse });

			return connectionsResponse;
		} catch (error) {
			const errorMsg = i18n.t("connectionsFetchError", { ns: "errors" });
			const errorLog = i18n.t("connectionsFetchErrorExtended", {
				ns: "errors",
				projectId,
				error: (error as Error).message,
			});
			useToastStore.getState().addToast({
				message: errorMsg,
				type: "error",
			});
			LoggerService.error(namespaces.stores.cache, errorLog);

			set((state) => ({ ...state, loading: { ...state.loading, connections: false } }));
		}
	},

	checkState: async (projectId, data) => {
		set((state) => ({ ...state, isValid: false }));
		const newProjectValidationState = { ...get().projectValidationState };

		if (data?.resources) {
			newProjectValidationState.code = {
				message: !Object.keys(data.resources).length
					? i18n.t("validation.noCodeAndAssets", { ns: "tabs" })
					: "",
				level: "error",
			};
		}

		if (data?.connections) {
			const notInitiatedConnections = data.connections.filter((c) => c.status !== "ok").length;

			newProjectValidationState.connections = {
				...newProjectValidationState.connections,
				message:
					notInitiatedConnections > 0 ? i18n.t("validation.connectionsNotConfigured", { ns: "tabs" }) : "",
			};
		}

		if (data?.triggers) {
			newProjectValidationState.triggers = {
				...newProjectValidationState.triggers,
				message: !data.triggers.length ? i18n.t("validation.noTriggers", { ns: "tabs" }) : "",
			};
		}

		if (data?.variables) {
			const isEmptyVarValue = data.variables?.find((varb) => varb.value === "");
			newProjectValidationState.variables = {
				...newProjectValidationState.variables,
				message: isEmptyVarValue ? i18n.t("validation.emptyVariable", { ns: "tabs" }) : "",
			};
		}

		const isInvalid = Object.values(newProjectValidationState).some(
			(error) => !!error.message && error.level === "error"
		);

		set((state) => ({
			...state,
			projectValidationState: newProjectValidationState,
			currentProjectId: projectId,
			isValid: !isInvalid,
		}));

		return;
	},
});

export const useCacheStore = create<CacheStore>(store);
