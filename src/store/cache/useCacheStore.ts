import { t } from "i18next";
import isEqual from "lodash/isEqual";
import { createSelector } from "reselect";
import { StateCreator, create } from "zustand";

import { maxResultsLimitToDisplay, namespaces } from "@constants";
import { DeploymentStateVariant } from "@enums";
import { CacheStore, ProjectValidationLevel } from "@interfaces/store";
import {
	ConnectionService,
	DeploymentsService,
	EventsService,
	IndexedDBService,
	IntegrationsService,
	LoggerService,
	ProjectsService,
	TriggersService,
	VariablesService,
} from "@services";

import { useFileStore, useToastStore, useOrganizationStore } from "@store";

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
	| "fetchResources"
	| "initCache"
	| "checkState"
	| "reset"
	| "setLoading"
> = {
	loading: {
		deployments: false,
		triggers: false,
		variables: false,
		events: false,
		connections: false,
		resourses: false,
		code: false,
	},
	deployments: undefined,
	variables: [],
	triggers: [],
	integrations: undefined,
	connections: undefined,
	resourses: undefined,
	events: undefined,
	currentProjectId: undefined,
	projectValidationState: defaultProjectValidationState,
	isValid: true,
	isProjectEvents: false,
};

const store: StateCreator<CacheStore> = (set, get) => ({
	...initialState,

	setLoading: (key, value) => set((state) => ({ ...state, loading: { ...state.loading, [key]: value } })),

	initCache: async (projectId, force = false) => {
		set((state) => ({ ...state, currentProjectId: projectId }));
		await Promise.all([
			get().fetchResources(projectId, force),
			get().fetchDeployments(projectId, force),
			get().fetchTriggers(projectId, force),
			get().fetchVariables(projectId, force),
			get().fetchConnections(projectId, force),
		]);
	},

	fetchIntegrations: async (force?: boolean) => {
		const { integrations } = get();
		if (integrations && !force) {
			return integrations;
		}

		try {
			const { data: incomingIntegrations, error } = await IntegrationsService.list();

			if (error) {
				useToastStore.getState().addToast({
					message: t("errorFetchingIntegrations", { ns: "errors" }),
					type: "error",
				});

				return;
			}

			if (isEqual(incomingIntegrations, integrations)) {
				return integrations;
			}
			set((state) => ({
				...state,
				integrations: incomingIntegrations,
			}));

			return incomingIntegrations;
		} catch (error) {
			LoggerService.error(
				namespaces.stores.cache,
				t("errorFetchingIntegrationsExtended", {
					ns: "errors",
					error: (error as Error).message,
				})
			);
		}
	},

	fetchResources: async (projectId, force) => {
		const dbService = new IndexedDBService("ProjectDB", "resources");

		const resourcesDB = await dbService.getAll(projectId);
		const { currentProjectId } = get();

		if (currentProjectId === projectId && !force) {
			return resourcesDB;
		}

		set((state) => ({
			...state,
			loading: { ...state.loading, resourses: true },
		}));
		try {
			const { data: resources, error } = await ProjectsService.getResources(projectId);

			if (error) {
				LoggerService.error(
					namespaces.resourcesService,
					t("resourcesFetchErrorExtended", { projectId, error: (error as Error).message, ns: "errors" }),
					true
				);

				return;
			}
			const files = [];
			for (const [name, content] of Object.entries(resources || {})) {
				files.push({ name, content: new Uint8Array(content) });
			}
			await dbService.put(projectId, files);

			if (resources) {
				get().checkState(projectId, { resources });
				useFileStore.getState().setFileList({ list: Object.keys(resources) });
			}

			return resources;
		} catch (error) {
			useToastStore.getState().addToast({
				message: t("resourcesFetchError", { ns: "errors" }),
				type: "error",
			});
			LoggerService.error(
				namespaces.resourcesService,
				t("resourcesFetchErrorExtended", { projectId, error: error.message, ns: "errors" })
			);

			return;
		} finally {
			set((state) => ({
				...state,
				loading: { ...state.loading, resourses: false },
			}));
		}
	},

	reset: async (type) => {
		set((state) => ({
			...state,
			loading: { ...state.loading, [type]: false },
			[type]: undefined,
		}));
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
			const { data: incomingDeployments, error } = await DeploymentsService.list(projectId);

			if (error) {
				const errorMsg = t("errorFetchingDeployments", { ns: "errors" });

				useToastStore.getState().addToast({
					message: errorMsg,
					type: "error",
				});
			}

			set((state) => ({
				...state,
				loading: { ...state.loading, deployments: false },
			}));

			if (isEqual(deployments, incomingDeployments)) {
				return deployments;
			}

			set((state) => ({
				...state,
				deployments: incomingDeployments,
			}));

			return incomingDeployments;
		} catch (error) {
			const errorMsg = t("errorFetchingDeployments", { ns: "errors" });
			const errorLog = t("errorFetchingDeploymentsExtended", {
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
			loading: { ...state.loading, triggers: true },
		}));

		try {
			const { data: incomingTriggers, error } = await TriggersService.list(projectId!);

			if (error) {
				throw error;
			}
			if (!incomingTriggers) {
				return;
			}

			set((state) => ({
				...state,
				loading: { ...state.loading, triggers: false },
			}));
			if (isEqual(triggers, incomingTriggers)) {
				return triggers;
			}

			set((state) => ({
				...state,
				triggers: incomingTriggers,
			}));

			get().checkState(projectId!, { triggers: incomingTriggers });

			return triggers;
		} catch (error) {
			const errorMsg = t("errorFetchingTriggers", { ns: "errors" });
			const errorLog = t("errorFetchingTriggersExtended", {
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

	fetchEvents: async (force, sourceId, projectId) => {
		const { events, isProjectEvents } = get();
		if (events && !force && !isProjectEvents) {
			return events;
		}
		const orgId = useOrganizationStore.getState().currentOrganization?.id;
		set((state) => ({
			...state,
			loading: { ...state.loading, events: true },
		}));

		try {
			const { data: incomingEvents, error } = await EventsService.list(
				maxResultsLimitToDisplay,
				sourceId,
				projectId,
				orgId
			);

			if (error) {
				const errorMsg = t("errorFetchingEvents", { ns: "errors" });

				useToastStore.getState().addToast({
					message: errorMsg,
					type: "error",
				});
			}

			set((state) => ({
				...state,
				events: incomingEvents,
				isProjectEvents: !!sourceId,
				loading: { ...state.loading, events: false },
			}));

			return incomingEvents;
		} catch (error) {
			const errorMsg = t("errorFetchingEvents", { ns: "errors" });
			const errorLog = t("errorFetchingEventsExtended", {
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
			loading: { ...state.loading, variables: true },
		}));

		try {
			const { data: vars, error } = await VariablesService.list(projectId);

			if (error) {
				const errorMsg = t("errorFetchingVariables", { ns: "errors" });
				const errorLog = t("errorFetchingVariablesExtended", {
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
				loading: { ...state.loading, variables: false },
			}));

			if (isEqual(variables, vars)) {
				return variables;
			}

			set((state) => ({
				...state,
				variables: vars,
			}));

			get().checkState(projectId!, { variables: vars });

			return vars;
		} catch (error) {
			const errorMsg = t("errorFetchingVariable", { ns: "errors" });
			const errorLog = t("errorFetchingVariableExtended", {
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
			const { data: connectionsResponse, error } = await ConnectionService.list(projectId!);

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
			const errorMsg = t("connectionsFetchError", { ns: "errors" });
			const errorLog = t("connectionsFetchErrorExtended", {
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
				message: !Object.keys(data.resources).length ? t("validation.noCodeAndAssets", { ns: "tabs" }) : "",
				level: "error",
			};
		}

		if (data?.connections) {
			const notInitiatedConnections = data.connections.filter((c) => c.status !== "ok").length;

			newProjectValidationState.connections = {
				...newProjectValidationState.connections,
				message: notInitiatedConnections > 0 ? t("validation.connectionsNotConfigured", { ns: "tabs" }) : "",
			};
		}

		if (data?.triggers) {
			newProjectValidationState.triggers = {
				...newProjectValidationState.triggers,
				message: !data.triggers.length ? t("validation.noTriggers", { ns: "tabs" }) : "",
			};
		}

		if (data?.variables) {
			const isEmptyVarValue = data.variables?.find((varb) => varb.value === "");
			newProjectValidationState.variables = {
				...newProjectValidationState.variables,
				message: isEmptyVarValue ? t("validation.emptyVariable", { ns: "tabs" }) : "",
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

const selectHasActiveDeployments = createSelector(
	(state: CacheStore) => state.deployments,
	(deployments) => deployments?.some(({ state }) => state === DeploymentStateVariant.active) || false
);

export const useCacheStore = create<CacheStore>(store);
export const useHasActiveDeployments = () => useCacheStore(selectHasActiveDeployments);
