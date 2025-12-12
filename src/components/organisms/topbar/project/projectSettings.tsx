import React, { useEffect } from "react";

import { useParams } from "react-router-dom";

import { useFileStore } from "@src/store";

import {
	ManualRunSettingsDrawer,
	ProjectTopbarButtons,
	ProjectTopbarName,
	ProjectTopbarNavigation,
} from "@components/organisms/topbar/project";

export const ProjectSettingsTopbar = () => {
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
		<div className="flex flex-wrap items-center justify-between gap-1 rounded-b-xl bg-gray-1250 pl-4 md:pl-7 lg:flex-nowrap lg:gap-0 max-md:pl-12">
			<ProjectTopbarName />
			<ProjectTopbarNavigation />
			<ProjectTopbarButtons />

			<ManualRunSettingsDrawer />
		</div>
	);
};
