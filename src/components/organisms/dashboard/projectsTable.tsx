import React, { useEffect, useState } from "react";

import { ProjectsService } from "@services";
import { DeploymentsService } from "@services/deployments.service";
import { DeploymentStateVariant } from "@src/enums";
import { Project } from "@type/models";

import { useProjectStore } from "@store";

export const DashboardProjectsTable = () => {
	const { projectsList } = useProjectStore();
	const [counter, setCounter] = useState(0);

	const loadProjectsData = async (projectsList: Project[]) => {
		for (const project of projectsList) {
			const { data: deployments } = await DeploymentsService.list(project.id);
			let deploymentId = "";
			deployments?.forEach((deployment) => {
				if (deployment.state === DeploymentStateVariant.active) {
					deploymentId = deployment.deploymentId;
				}
			});

			if (deploymentId) {
				await DeploymentsService.deactivate(deploymentId);
				await ProjectsService.delete(project.id);
				return;
			} else {
				await ProjectsService.delete(project.id);
			}
			setCounter((prev) => prev + 1);
		}
	};

	useEffect(() => {
		if (projectsList) loadProjectsData(projectsList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex size-full items-center justify-center text-xl">
			{counter} out of {projectsList.length}
		</div>
	);
};
