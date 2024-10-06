import i18n from "i18next";
import { StateCreator, create } from "zustand";

import { DeploymentsService, LoggerService, TriggersService } from "@services";
import { namespaces } from "@src/constants";
import { CacheStore } from "@src/interfaces/store";

import { useToastStore } from "@store";

const initialState: Pick<CacheStore, "loading" | "triggers" | "deployments" | "currentProjectId"> = {
	loading: {
		deployments: false,
		triggers: false,
	},
	deployments: undefined,
	triggers: [],
	currentProjectId: undefined,
};

const store: StateCreator<CacheStore> = (set, get) => ({
	...initialState,

	fetchDeployments: async (projectId: string, force?: boolean) => {
		const { currentProjectId, deployments } = get();
		if (currentProjectId === projectId && !force) {
			return deployments;
		}

		set((state) => ({
			...state,
			currentProjectId: projectId,
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

	fetchTriggers: async (projectId: string, force?: boolean) => {
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
});

export const useCacheStore = create<CacheStore>(store);
