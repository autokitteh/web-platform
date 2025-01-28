import React, { useEffect } from "react";

import { DeploymentsService } from "@services";
import { ProjectsService } from "@services/projects.service";
import { DeploymentStateVariant } from "@src/enums";
import { Project } from "@type/models";

import { useProjectStore } from "@store";

export const DashboardProjectsTable = () => {
	const { projectsList } = useProjectStore();

	const [i, setI] = React.useState(0);
	const [j, setJ] = React.useState(0);

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

	const deactivateProjects = async (projectsList: Project[]) => {
		for (let j = 0; j < projectsList.length; j++) {
			setJ(j);

			// Get deployments for current project
			const { data: deployments } = await DeploymentsService.list(projectsList[i].id);

			// Find active deployment if exists
			const activeDeployment = deployments?.find(
				(deployment) => deployment.state === DeploymentStateVariant.active
			);

			if (activeDeployment) {
				await DeploymentsService.deactivate(activeDeployment.deploymentId);
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

	const deactivateAndDelete = async (projectsList: Project[]) => {
		await deactivateProjects(projectsList);
		await eraseProjects(projectsList);
	};

	useEffect(() => {
		deactivateAndDelete(projectsList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectsList]);

	return (
		<div className="flex h-screen w-screen items-center justify-center text-4xl text-black">
			Deactivating... {j} out of {projectsList.length}
			<br />
			Deleting... {i} out of {projectsList.length}
		</div>
	);
};
