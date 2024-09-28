import i18n from "i18next";
import { StateCreator, create } from "zustand";

import { DeploymentsService, LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { CacheStore } from "@src/interfaces/store";

import { useToastStore } from "@store";

const initialState: Pick<CacheStore, "loading" | "deployments" | "currentProjectId"> = {
	loading: {
		deployments: false,
	},
	deployments: undefined,
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
});

export const useCacheStore = create<CacheStore>(store);
