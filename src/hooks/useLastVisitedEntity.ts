import { useEffect } from "react";

import { useCacheStore, useProjectStore } from "@src/store";

export const useLastVisitedEntity = (projectId?: string, paramDeploymentId?: string, sessionId?: string) => {
	const { latestOpened, setLatestOpened } = useProjectStore();
	const { deployments } = useCacheStore();

	useEffect(() => {
		if (!paramDeploymentId && !sessionId && projectId !== latestOpened.projectId) {
			setLatestOpened("deploymentId", "", projectId!);
			setLatestOpened("sessionId", "", projectId!);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paramDeploymentId, sessionId, projectId, latestOpened.projectId]);

	useEffect(() => {
		if (paramDeploymentId) {
			setLatestOpened("deploymentId", paramDeploymentId, projectId!);
			setLatestOpened("sessionId", "", projectId!);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paramDeploymentId, projectId]);

	useEffect(() => {
		if (sessionId) {
			setLatestOpened("sessionId", sessionId, projectId!);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, projectId]);

	return {
		deploymentId:
			latestOpened.deploymentId && latestOpened.projectId === projectId
				? latestOpened.deploymentId
				: paramDeploymentId || deployments?.[0]?.deploymentId,
		deployments,
	};
};
