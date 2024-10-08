import React, { useEffect, useMemo } from "react";

import { useLocation, useParams } from "react-router-dom";

import { useCacheStore } from "@src/store";

import { useFileOperations } from "@hooks";

import {
	ManualRunButtons,
	ManualRunSettingsDrawer,
	ProjectTopbarButtons,
	ProjectTopbarName,
	ProjectTopbarNavigation,
} from "@components/organisms/topbar/project";

export const ProjectConfigTopbar = () => {
	const { deploymentId, projectId } = useParams();
	const location = useLocation();
	const { openProjectId, setOpenProjectId } = useFileOperations(projectId!);
	const { fetchDeployments } = useCacheStore();

	useEffect(() => {
		if (!projectId) return;

		if (projectId !== openProjectId) {
			setOpenProjectId(projectId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const isDeploymentsPage = useMemo(() => location.pathname.endsWith("deployments"), [location.pathname]);
	const isProjectPage = useMemo(
		() => !location.pathname.includes(deploymentId!) && !isDeploymentsPage,
		[location.pathname, deploymentId, isDeploymentsPage]
	);

	return (
		<div className="flex justify-between rounded-b-xl bg-gray-1250 pl-7 pr-3">
			<ProjectTopbarName />

			<ProjectTopbarNavigation />

			{isDeploymentsPage ? <ManualRunButtons /> : null}
			{isProjectPage ? <ProjectTopbarButtons /> : null}
			<ManualRunSettingsDrawer onRun={() => fetchDeployments(projectId!)} />
		</div>
	);
};
