import React, { useEffect } from "react";

import { ProjectsService } from "@services/projects.service";
import { Project } from "@type/models";

import { useProjectStore } from "@store";

export const DashboardProjectsTable = () => {
	const { projectsList } = useProjectStore();

	const [i, setI] = React.useState(0);

	const eraseProjects = async (projectsList: Project[]) => {
		for (let i = 0; i < projectsList.length; i++) {
			setI(i);
			const project = projectsList[i];
			await ProjectsService.delete(project.id);

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
	}, [projectsList]);

	return (
		<div className="flex h-screen w-screen items-center justify-center text-4xl text-black">
			Processing... {i} out of {projectsList.length}
		</div>
	);
};
