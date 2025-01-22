import React, { useEffect } from "react";

import { useParams } from "react-router-dom";

import { useFileOperations } from "@hooks";

import {
	ManualRunSettingsDrawer,
	ProjectTopbarButtons,
	ProjectTopbarName,
	ProjectTopbarNavigation,
} from "@components/organisms/topbar/project";

export const ProjectConfigTopbar = () => {
	const { projectId } = useParams();
	const { openProjectId, setOpenProjectId } = useFileOperations(projectId!);

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
			<div className="flex">
				<div className="w-300 shrink-0" />
				<ProjectTopbarButtons />
			</div>

			<ManualRunSettingsDrawer />
		</div>
	);
};
