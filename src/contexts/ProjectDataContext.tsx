import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { DeploymentStateVariant } from "@enums";
import { useProjectValidation, ProjectValidationLevel } from "@hooks/useProjectValidation";
import {
	ConnectionService,
	DeploymentsService,
	ProjectsService,
	TriggersService,
	VariablesService,
	LoggerService,
	IndexedDBService,
} from "@services";
import { namespaces } from "@src/constants";
import { BaseEvent, Connection, Deployment, Integration, Trigger, Variable } from "@type/models";

import { useToastStore, useFileStore } from "@store";

interface LoadingState {
	deployments: boolean;
	triggers: boolean;
	variables: boolean;
	events: boolean;
	connections: boolean;
	resources: boolean;
	code: boolean;
}

interface ProjectDataContextType {
	// Data
	deployments?: Deployment[];
	triggers: Trigger[];
	events?: BaseEvent[];
	integrations?: Integration[];
	variables: Variable[];
	connections?: Connection[];
	resources?: Record<string, Uint8Array>;
	currentProjectId?: string;

	// Loading states
	loading: LoadingState;

	// Validation
	projectValidationState: {
		code: { level?: ProjectValidationLevel; message?: string };
		connections: { level?: ProjectValidationLevel; message?: string };
		triggers: { level?: ProjectValidationLevel; message?: string };
		variables: { level?: ProjectValidationLevel; message?: string };
	};
	isValid: boolean;

	// Active deployments check
	hasActiveDeployments: boolean;

	// Actions
	setLoading: (key: keyof LoadingState, value: boolean) => void;
	initCache: (projectId: string, force?: boolean) => Promise<void>;
	fetchDeployments: (projectId: string, force?: boolean) => Promise<Deployment[] | void>;
	fetchTriggers: (projectId: string, force?: boolean) => Promise<Trigger[] | void>;
	fetchVariables: (projectId: string, force?: boolean) => Promise<Variable[] | void>;
	fetchConnections: (projectId: string, force?: boolean) => Promise<Connection[] | void>;
	fetchResources: (projectId: string, force?: boolean) => Promise<Record<string, Uint8Array> | void>;
	reset: (type: keyof Omit<LoadingState, "events" | "code">) => void;
}

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(undefined);

const initialLoadingState: LoadingState = {
	deployments: false,
	triggers: false,
	variables: false,
	events: false,
	connections: false,
	resources: false,
	code: false,
};

export const ProjectDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const { t } = useTranslation("errors");
	const { projectId } = useParams();
	const addToast = useToastStore((state) => state.addToast);

	// State
	const [deployments, setDeployments] = useState<Deployment[]>();
	const [triggers, setTriggers] = useState<Trigger[]>([]);
	const [events, setEvents] = useState<BaseEvent[]>();
	const [integrations, setIntegrations] = useState<Integration[]>();
	const [variables, setVariables] = useState<Variable[]>([]);
	const [connections, setConnections] = useState<Connection[]>();
	const [resources, setResources] = useState<Record<string, Uint8Array>>();
	const [currentProjectId, setCurrentProjectId] = useState<string>();
	const [loading, setLoadingState] = useState<LoadingState>(initialLoadingState);

	const { projectValidationState, isValid, checkState } = useProjectValidation();

	const hasActiveDeployments = deployments?.some(({ state }) => state === DeploymentStateVariant.active) || false;

	const setLoading = useCallback((key: keyof LoadingState, value: boolean) => {
		setLoadingState((prev) => ({ ...prev, [key]: value }));
	}, []);

	const fetchResources = useCallback(
		async (projectId: string, force?: boolean) => {
			const dbService = new IndexedDBService("ProjectDB", "resources");

			const resourcesDB = await dbService.getAll(projectId);

			if (currentProjectId === projectId && !force) {
				return resourcesDB;
			}

			setLoading("resources", true);
			try {
				const { data: resources, error } = await ProjectsService.getResources(projectId);

				if (error) {
					LoggerService.error(
						namespaces.resourcesService,
						t("resourcesFetchErrorExtended", { projectId, error: (error as Error).message }),
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
					checkState(projectId, { resources });
					useFileStore.getState().setFileList({ list: Object.keys(resources) });
					setResources(resources);
				}

				return resources;
			} catch (error) {
				addToast({
					message: t("resourcesFetchError"),
					type: "error",
				});
				LoggerService.error(
					namespaces.resourcesService,
					t("resourcesFetchErrorExtended", { projectId, error: (error as Error).message })
				);
			} finally {
				setLoading("resources", false);
			}
		},
		[currentProjectId, setLoading, checkState, addToast, t]
	);

	const fetchDeployments = useCallback(
		async (projectId: string, force?: boolean) => {
			if (currentProjectId === projectId && !force && deployments) {
				return deployments;
			}

			setLoading("deployments", true);

			try {
				const { data: incomingDeployments, error } = await DeploymentsService.list(projectId);

				if (error) {
					const errorMsg = t("errorFetchingDeployments");
					addToast({
						message: errorMsg,
						type: "error",
					});
					return;
				}

				setDeployments(incomingDeployments);
				return incomingDeployments;
			} catch (error) {
				const errorMsg = t("errorFetchingDeployments");
				const errorLog = t("errorFetchingDeploymentsExtended", {
					error: (error as Error).message,
				});
				addToast({
					message: errorMsg,
					type: "error",
				});
				LoggerService.error(namespaces.stores.cache, errorLog);
			} finally {
				setLoading("deployments", false);
			}
		},
		[currentProjectId, deployments, setLoading, addToast, t]
	);

	const fetchTriggers = useCallback(
		async (projectId: string, force?: boolean) => {
			if (currentProjectId === projectId && triggers?.length && !force) {
				return triggers;
			}

			setLoading("triggers", true);

			try {
				const { data: incomingTriggers, error } = await TriggersService.list(projectId);

				if (error) {
					throw error;
				}
				if (!incomingTriggers) {
					return;
				}

				setTriggers(incomingTriggers);
				checkState(projectId, { triggers: incomingTriggers });
				return incomingTriggers;
			} catch (error) {
				const errorMsg = t("errorFetchingTriggers");
				const errorLog = t("errorFetchingTriggersExtended", {
					error: (error as Error).message,
				});
				addToast({
					message: errorMsg,
					type: "error",
				});
				LoggerService.error(namespaces.stores.cache, errorLog);
			} finally {
				setLoading("triggers", false);
			}
		},
		[currentProjectId, triggers, setLoading, checkState, addToast, t]
	);

	const fetchVariables = useCallback(
		async (projectId: string, force?: boolean) => {
			if (currentProjectId === projectId && !force && variables.length) {
				return variables;
			}

			setLoading("variables", true);

			try {
				const { data: vars, error } = await VariablesService.list(projectId);

				if (error) {
					const errorMsg = t("errorFetchingVariables");
					const errorLog = t("errorFetchingVariablesExtended", {
						error: (error as Error).message,
					});
					addToast({
						message: errorMsg,
						type: "error",
					});
					LoggerService.error(namespaces.stores.cache, errorLog);
				} else if (vars) {
					setVariables(vars);
					checkState(projectId, { variables: vars });
				}

				return vars;
			} catch (error) {
				const errorMsg = t("errorFetchingVariable");
				const errorLog = t("errorFetchingVariableExtended", {
					error: (error as Error).message,
				});
				addToast({
					message: errorMsg,
					type: "error",
				});
				LoggerService.error(namespaces.stores.cache, errorLog);
			} finally {
				setLoading("variables", false);
			}
		},
		[currentProjectId, variables, setLoading, checkState, addToast, t]
	);

	const fetchConnections = useCallback(
		async (projectId: string, force?: boolean) => {
			if (currentProjectId === projectId && !force && connections) {
				return connections;
			}

			setLoading("connections", true);

			try {
				const { data: connectionsResponse, error } = await ConnectionService.list(projectId);

				if (error) {
					throw error;
				}

				setConnections(connectionsResponse);
				checkState(projectId, { connections: connectionsResponse });
				return connectionsResponse;
			} catch (error) {
				const errorMsg = t("connectionsFetchError");
				const errorLog = t("connectionsFetchErrorExtended", {
					projectId,
					error: (error as Error).message,
				});
				addToast({
					message: errorMsg,
					type: "error",
				});
				LoggerService.error(namespaces.stores.cache, errorLog);
			} finally {
				setLoading("connections", false);
			}
		},
		[currentProjectId, connections, setLoading, checkState, addToast, t]
	);

	const initCache = useCallback(
		async (projectId: string, force = false) => {
			setCurrentProjectId(projectId);
			await Promise.all([
				fetchResources(projectId, force),
				fetchDeployments(projectId, force),
				fetchTriggers(projectId, force),
				fetchVariables(projectId, force),
				fetchConnections(projectId, force),
			]);
		},
		[fetchResources, fetchDeployments, fetchTriggers, fetchVariables, fetchConnections]
	);

	const reset = useCallback(
		(type: keyof Omit<LoadingState, "events" | "code">) => {
			setLoading(type, false);
			switch (type) {
				case "deployments":
					setDeployments(undefined);
					break;
				case "triggers":
					setTriggers([]);
					break;
				case "variables":
					setVariables([]);
					break;
				case "connections":
					setConnections(undefined);
					break;
				case "resources":
					setResources(undefined);
					break;
			}
		},
		[setLoading]
	);

	// Initialize cache when projectId changes
	useEffect(() => {
		if (projectId && projectId !== currentProjectId) {
			initCache(projectId);
		}
	}, [projectId, currentProjectId, initCache]);

	const value: ProjectDataContextType = {
		// Data
		deployments,
		triggers,
		events,
		integrations,
		variables,
		connections,
		resources,
		currentProjectId,

		// Loading states
		loading,

		// Validation
		projectValidationState,
		isValid,

		// Active deployments check
		hasActiveDeployments,

		// Actions
		setLoading,
		initCache,
		fetchDeployments,
		fetchTriggers,
		fetchVariables,
		fetchConnections,
		fetchResources,
		reset,
	};

	return <ProjectDataContext.Provider value={value}>{children}</ProjectDataContext.Provider>;
};

export const useProjectData = () => {
	const context = useContext(ProjectDataContext);
	if (context === undefined) {
		throw new Error("useProjectData must be used within a ProjectDataProvider");
	}
	return context;
};
