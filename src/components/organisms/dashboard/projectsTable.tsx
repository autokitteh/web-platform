import React, { useEffect } from "react";

import { ProjectsService } from "@services/projects.service";
import { Project } from "@type/models";

import { useProjectStore } from "@store";

export const DashboardProjectsTable = () => {
	const { projectsList } = useProjectStore();
	let i = 0;

	const eraseProjects = async (projectsList: Project[]) => {
		for (i = 0; i < projectsList.length; i++) {
			await ProjectsService.delete(projectsList[i].id);

			// After every 10 projects, wait 30 seconds
			if (i > 0 && i % 10 === 0) {
				await new Promise((resolve) => setTimeout(resolve, 30000));
			} else {
				// Wait 5 seconds between each delete
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}
		}
	};

	useEffect(() => {
		eraseProjects(projectsList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectsList]);

	return <div className="flex h-screen w-screen items-center justify-center text-4xl text-black">{i}</div>;
};
