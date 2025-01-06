import React, { useEffect } from "react";

import { DeploymentsService } from "@services";
import { ProjectsService } from "@services/projects.service";
import { DeploymentStateVariant } from "@src/enums";
import { Project } from "@type/models";

import { useProjectStore } from "@store";

export const DashboardProjectsTable = () => {
	const { projectsList } = useProjectStore();

	const [i, setI] = React.useState(0);

	const deactivateProjects = async (projectsList: Project[]) => {
		for (let i = 0; i < projectsList.length; i++) {
			setI(i);

			// Get deployments for current project
			const { data: deployments } = await DeploymentsService.list(projectsList[i].id);

			// Find active deployment if exists
			const activeDeployment = deployments?.find(
				(deployment) => deployment.state === DeploymentStateVariant.active
			);

			if (activeDeployment) {
				await DeploymentsService.deactivate(activeDeployment.deploymentId);
				await ProjectsService.delete(projectsList[i].id);
			}

			// After every 10 projects, wait 30 seconds
			if (i > 0 && i % 10 === 0) {
				await new Promise((resolve) => setTimeout(resolve, 30000));
			} else {
				// Wait 5 seconds between each project
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}
		}
	};

	useEffect(() => {
		deactivateProjects(projectsList);
	}, [projectsList]);

	return (
		<div className="flex h-screen w-screen items-center justify-center text-4xl text-black">
			Processing... {i} out of {projectsList.length}
		</div>
	);
};
