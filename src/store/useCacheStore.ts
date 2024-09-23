import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

import { DeploymentsService } from "@services";
import { StoreName } from "@src/enums";

export interface CacheStore {
	projectLastDeployment?: Record<string, string>;
	fetchLastDeploymentId: (projectId: string, force?: boolean) => Promise<void>;
}

const store: StateCreator<CacheStore> = (set, get) => ({
	projectLastDeployment: undefined,

	fetchLastDeploymentId: async (projectId: string, force?: boolean) => {
		const { projectLastDeployment } = get();

		if (projectLastDeployment?.projectId === projectId && !force) {
			return;
		}

		const { data: deployments, error } = await DeploymentsService.listByProjectId(projectId);

		if (error) {
			return;
		}

		if (!deployments) {
			return;
		}
		if (!deployments.length) {
			set({
				projectLastDeployment: {
					[projectId]: "",
				},
			});

			return;
		}

		set({
			projectLastDeployment: {
				[projectId]: deployments[deployments.length - 1].deploymentId,
			},
		});
	},
});

export const useCacheStore = create(persist(store, { name: StoreName.cache }));
