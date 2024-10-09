import React from "react";

import { useParams } from "react-router-dom";

import { useCacheStore } from "@src/store";

import {
	ManualRunButtons,
	ManualRunSettingsDrawer,
	ProjectTopbarName,
	ProjectTopbarNavigation,
} from "@components/organisms/topbar/project";

export const ProjectTopbarWithManualRun = () => {
	const { projectId } = useParams();
	const { fetchDeployments } = useCacheStore();

	return (
		<div className="flex justify-between rounded-b-xl bg-gray-1250 pl-7 pr-3">
			<ProjectTopbarName />

			<ProjectTopbarNavigation />

			<ManualRunButtons />
			<ManualRunSettingsDrawer onRun={() => fetchDeployments(projectId!)} />
		</div>
	);
};
