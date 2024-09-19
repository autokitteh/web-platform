import React, { useEffect } from "react";

import { useParams } from "react-router-dom";

import { useFileOperations } from "@hooks";

import { ProjectTopbarButtons, ProjectTopbarName, ProjectTopbarNavigation } from "@components/organisms/topbar/project";

export const ProjectConfigTopbar = () => {
	const { projectId } = useParams();

	const { openProjectId, setOpenFiles, setOpenProjectId } = useFileOperations(projectId!);

	useEffect(() => {
		if (!projectId) return;

		if (projectId !== openProjectId) {
			setOpenProjectId(projectId);
			setOpenFiles([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return (
		<div className="flex justify-between rounded-b-xl bg-gray-1250 pl-7 pr-3">
			<ProjectTopbarName />

			<ProjectTopbarNavigation />

			<ProjectTopbarButtons />
		</div>
	);
};
