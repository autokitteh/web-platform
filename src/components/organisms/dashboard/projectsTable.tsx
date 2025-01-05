import React, { useEffect } from "react";

import { DeploymentsService } from "@services";
import { ProjectsService } from "@services/projects.service";
import { DeploymentStateVariant } from "@src/enums";
import { Project } from "@type/models";

import { useProjectStore } from "@store";

export const DashboardProjectsTable = () => {
	const { projectsList, getProjectsList } = useProjectStore();

	const [i, setI] = React.useState(0);

	const eraseProjects = async (projectsList: Project[]) => {
		for (let i = 0; i < projectsList.length; i++) {
			setI(i);
			const project = projectsList[i];
			const { error } = await ProjectsService.delete(project.id);
			if (error) {
				const deactivated = await deactivateProject(project.id);
				if (deactivated) await ProjectsService.delete(project.id);
			}

			// After every 10 projects, wait 30 seconds
			if (i > 0 && i % 10 === 0) {
				await new Promise((resolve) => setTimeout(resolve, 6000));
			} else {
				// Wait 5 seconds between each delete
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		}
	};

	const deactivateProject = async (projectId: string) => {
		try {
			const { data: deployments } = await DeploymentsService.list(projectId);
			const activeDeployment = deployments?.find(
				(deployment) => deployment.state === DeploymentStateVariant.active
			);

			if (activeDeployment) {
				await DeploymentsService.deactivate(activeDeployment.deploymentId);
			}
			return true;
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("Error deactivating project", projectId, error);
			return false;
		}
	};

	const deactivateAndDelete = async (projectsList: Project[]) => {
		await getProjectsList();
		await eraseProjects(projectsList);
	};

	useEffect(() => {
		deactivateAndDelete(projectsList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectsList]);

	return (
		<div className="flex h-screen w-screen items-center justify-center text-4xl text-black">
			Deleting... {i} out of {projectsList.length}
		</div>
	);
};
