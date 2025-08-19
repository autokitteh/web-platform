import React, { useEffect } from "react";

import { useParams } from "react-router-dom";

import { useFileStore } from "@src/store";

import {
	ManualRunSettingsDrawer,
	ProjectTopbarButtons,
	ProjectTopbarName,
	ProjectTopbarNavigation,
} from "@components/organisms/topbar/project";

export const ProjectConfigTopbar = () => {
	const { projectId } = useParams();
	const { openProjectId, setOpenProjectId } = useFileStore();

	useEffect(() => {
		if (!projectId) return;

		if (projectId !== openProjectId) {
			setOpenProjectId(projectId);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return (
		<div className="flex justify-between rounded-b-xl bg-gray-1250 pl-7">
			<ProjectTopbarName />
			<ProjectTopbarNavigation />
			<ProjectTopbarButtons />

			<ManualRunSettingsDrawer />
		</div>
	);
};
