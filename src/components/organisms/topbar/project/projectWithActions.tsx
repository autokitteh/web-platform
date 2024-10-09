import React, { useEffect } from "react";

import { useParams } from "react-router-dom";

import { useCacheStore } from "@src/store";

import { useFileOperations } from "@hooks";

import {
	ManualRunSettingsDrawer,
	ProjectTopbarButtons,
	ProjectTopbarName,
	ProjectTopbarNavigation,
} from "@components/organisms/topbar/project";

export const ProjectTopbarWithActions = () => {
	const { projectId } = useParams();
	const { openProjectId, setOpenProjectId } = useFileOperations(projectId!);
	const { fetchDeployments } = useCacheStore();

	useEffect(() => {
		if (!projectId) return;

		if (projectId !== openProjectId) {
			setOpenProjectId(projectId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return (
		<div className="flex justify-between rounded-b-xl bg-gray-1250 pl-7 pr-3">
			<ProjectTopbarName />

			<ProjectTopbarNavigation />

			<ProjectTopbarButtons />
			<ManualRunSettingsDrawer onRun={() => fetchDeployments(projectId!)} />
		</div>
	);
};
