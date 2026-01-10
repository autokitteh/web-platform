import { t } from "i18next";
import isEqual from "lodash/isEqual";
import { createSelector } from "reselect";
import { create } from "zustand";

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
import { getTriggersWithBadConnections } from "@utilities";

import { useFileStore, useToastStore, useOrganizationStore, useOrgConnectionsStore } from "@store";

export const defaultSectionValidationState = {
	message: "",
	level: "warning" as ProjectValidationLevel,
};

export const defaultProjectValidationState = {
	resources: defaultSectionValidationState,
	connections: defaultSectionValidationState,
	triggers: defaultSectionValidationState,
	variables: defaultSectionValidationState,
};

const initialState: Omit<
	CacheStore,
	| "fetchDeployments"
	| "fetchTriggers"
	| "fetchVariables"
	| "fetchEvents"
	| "fetchConnections"
	| "fetchAllConnections"
	| "fetchResources"
	| "fetchIntegrations"
	| "checkState"
	| "reset"
	| "setLoading"
	| "getLatestValidationState"
> = {
	loading: {
		deployments: false,
		triggers: false,
		variables: false,
		events: false,
		connections: false,
		resources: false,
	},
	deployments: undefined,
	variables: [],
	triggers: [],
	integrations: undefined,
	connections: undefined,
	resources: undefined,
	events: undefined,
	currentProjectId: undefined,
	projectValidationState: defaultProjectValidationState,
	isValid: true,
	isProjectEvents: false,
};

const store = (
	set: (partial: Partial<CacheStore> | ((state: CacheStore) => Partial<CacheStore>)) => void,
	get: () => CacheStore
): CacheStore => ({
	...initialState,

	setLoading: (key, value) => set((state) => ({ ...state, loading: { ...state.loading, [key]: value } })),

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
			loading: { ...state.loading, resources: true },
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
				if (name && name.trim().length > 0) {
					files.push({ name, content: new Uint8Array(content) });
				}
			}
			await dbService.replaceAll(projectId, files);

			if (resources) {
				await get().checkState(projectId, { resources });
				useFileStore.getState().setFileList({ list: Object.keys(resources) });

				set((state) => ({
					...state,
					resources: resources,
				}));
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
				loading: { ...state.loading, resources: false },
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

	fetchTriggers: async (projectId, force) => {
		const { currentProjectId, triggers } = get();
		if (currentProjectId === projectId && !force && triggers?.length) {
			return triggers;
		}

		set((state) => ({
			...state,
			loading: { ...state.loading, triggers: true },
		}));

		try {
			const { data: incomingTriggers, error } = await TriggersService.list(projectId!);

			if (error) {
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
				return;
			}

			if (!incomingTriggers) {
				set((state) => ({
					...state,
					loading: { ...state.loading, triggers: false },
				}));
				return [];
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

			await get().checkState(projectId!, { triggers: incomingTriggers });

			return incomingTriggers;
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

	fetchEvents: async ({ projectId, sourceId }) => {
		const orgId = useOrganizationStore.getState().currentOrganization?.id;
		set((state) => ({
			...state,
			loading: { ...state.loading, events: true },
		}));

		try {
			const { data: incomingEvents, error } = await EventsService.list({
				limit: maxResultsLimitToDisplay,
				projectId,
				orgId,
				destinationId: sourceId,
			});

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

			return;
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
				return;
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

			await get().checkState(projectId!, { variables: vars });

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
			loading: { ...state.loading, connections: true },
		}));

		try {
			const { data: connectionsResponse, error } = await ConnectionService.list(projectId!);

			if (error) {
				const errorMsg = t("errorFetchingConnections", { ns: "errors" });
				const errorLog = t("errorFetchingConnectionsExtended", {
					ns: "errors",
					error: (error as Error).message,
				});
				useToastStore.getState().addToast({
					message: errorMsg,
					type: "error",
				});
				LoggerService.error(namespaces.stores.cache, errorLog);
				return;
			}

			set((state) => ({
				...state,
				loading: { ...state.loading, connections: false },
			}));

			const filterOutGlobalConnections = connectionsResponse?.filter((connection) => !!connection.projectId);

			if (isEqual(connections, filterOutGlobalConnections)) {
				return connections;
			}

			set((state) => ({
				...state,
				connections: filterOutGlobalConnections,
			}));

			await get().checkState(projectId!, { connections: filterOutGlobalConnections });

			return filterOutGlobalConnections;
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

	fetchAllConnections: async (projectId, orgId, force) => {
		await Promise.all([
			orgId ? useOrgConnectionsStore.getState().fetchOrgConnections(orgId, force) : Promise.resolve(),
			get().fetchConnections(projectId, force),
		]);
	},

	getLatestValidationState: async (projectId, section) => {
		try {
			const checkSectionState = async <T>(
				key: "resources" | "connections" | "triggers" | "variables",
				value?: T
			) => {
				if (value === undefined) {
					return;
				}

				await get().checkState(projectId, { [key]: value } as Partial<Parameters<CacheStore["checkState"]>[1]>);
			};

			switch (section) {
				case "resources": {
					const resources = (await get().fetchResources(projectId, true)) ?? get().resources;
					await checkSectionState("resources", resources);
					break;
				}
				case "connections": {
					const connections = (await get().fetchConnections(projectId, true)) ?? get().connections;
					await checkSectionState("connections", connections);
					break;
				}
				case "triggers": {
					await get().fetchConnections(projectId, true);
					const triggers = (await get().fetchTriggers(projectId, true)) ?? get().triggers;
					await checkSectionState("triggers", triggers);
					break;
				}
				case "variables": {
					const variables = (await get().fetchVariables(projectId, true)) ?? get().variables;
					await checkSectionState("variables", variables);
					break;
				}
				default:
					break;
			}

			return get().projectValidationState;
		} catch (error) {
			LoggerService.error(
				namespaces.stores.cache,
				t("validation.errorFetchingValidationState", { error, ns: "errors" })
			);
			return get().projectValidationState ?? undefined;
		}
	},

	checkState: async (projectId, data) => {
		set((state) => ({ ...state, isValid: false }));
		const newProjectValidationState = { ...get().projectValidationState };

		if (data?.resources) {
			newProjectValidationState.resources = {
				message: !Object.keys(data.resources).length ? t("validation.noFiles", { ns: "tabs" }) : "",
				level: "error",
			};
		}

		if (data?.connections) {
			const notInitiatedConnections = data.connections.filter((c) => c.status !== "ok").length;
			newProjectValidationState.connections = {
				message: notInitiatedConnections > 0 ? t("validation.connectionsNotConfigured", { ns: "tabs" }) : "",
				level: "warning",
			};
		}

		if (data?.triggers) {
			const triggerMessage = !data.triggers.length
				? t("validation.noTriggers", { ns: "tabs" })
				: (() => {
						const connections = get().connections || [];
						const triggersWithBadConnections = getTriggersWithBadConnections(data.triggers, connections);

						if (triggersWithBadConnections.length > 0) {
							return t("validation.triggerConnectionNotConfigured", { ns: "tabs" });
						}
						return "";
					})();

			newProjectValidationState.triggers = {
				...newProjectValidationState.triggers,
				message: triggerMessage,
				level: "error",
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

		return !isInvalid;
	},
});

const selectHasActiveDeployments = createSelector(
	(state: CacheStore) => state.deployments,
	(deployments) => deployments?.some(({ state }) => state === DeploymentStateVariant.active) || false
);

export const useCacheStore = create<CacheStore>()(store);
export const useHasActiveDeployments = () => useCacheStore(selectHasActiveDeployments);
