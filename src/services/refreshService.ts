import { t } from "i18next";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";

export const refreshDeploymentsAndManualRun = (): void => {
	void Promise.all([import("@src/store/cache/useCacheStore"), import("@src/store/useManualRunStore")])
		.then(([{ useCacheStore }, { useManualRunStore }]) => {
			const { fetchDeployments, currentProjectId } = useCacheStore.getState();
			const { fetchManualRunConfiguration } = useManualRunStore.getState();

			if (currentProjectId) {
				fetchDeployments(currentProjectId, true);
				fetchManualRunConfiguration(currentProjectId);
			}
			return true;
		})
		.catch((error) => {
			LoggerService.error(
				namespaces.refreshService,
				t("errors.refreshService.errorRefreshingDeploymentsAndManualRun", {
					ns: "services",
					error,
				})
			);
			return false;
		});
};
