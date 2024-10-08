import React, { useEffect } from "react";

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
	const { projectId } = useParams();
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

	const isDeploymentsPage = location.pathname.endsWith("/deployments");

	return (
		<div className="flex justify-between rounded-b-xl bg-gray-1250 pl-7 pr-3">
			<ProjectTopbarName />

			<ProjectTopbarNavigation />

			{isDeploymentsPage ? <ManualRunButtons /> : <ProjectTopbarButtons />}

			<ManualRunSettingsDrawer onRun={() => fetchDeployments(projectId!)} />
		</div>
	);
};
