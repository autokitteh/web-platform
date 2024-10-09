import React from "react";

import { useParams } from "react-router-dom";

import { useCacheStore } from "@src/store";

import {
	ManualRunSettingsDrawer,
	ProjectTopbarName,
	ProjectTopbarNavigation,
} from "@components/organisms/topbar/project";

export const ProjectHeaderBasic = () => {
	const { projectId } = useParams();
	const { fetchDeployments } = useCacheStore();

	return (
		<div className="flex justify-between rounded-b-xl bg-gray-1250 pl-7 pr-3">
			<ProjectTopbarName />

			<ProjectTopbarNavigation />
			<ManualRunSettingsDrawer onRun={() => fetchDeployments(projectId!)} />
		</div>
	);
};
