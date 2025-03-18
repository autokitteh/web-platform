import React, { useEffect, useState, useCallback } from "react";

import { ProjectsService } from "@services";
import { DeploymentsService } from "@services/deployments.service";
import { DeploymentStateVariant } from "@src/enums";
import { Project } from "@type/models";

import { useProjectStore } from "@store";

// Helper to limit API calls to avoid rate limiting (50 requests per minute)
const rateLimit = (fn, limit = 45) => {
	const queue = [];
	let activeCount = 0;

	const processQueue = async () => {
		if (queue.length === 0 || activeCount >= limit) return;

		activeCount++;
		const { task, resolve, reject } = queue.shift();

		try {
			const result = await task();
			resolve(result);
		} catch (error) {
			reject(error);
		} finally {
			activeCount--;
			setTimeout(processQueue, 0);
		}
	};

	return (task) => {
		return new Promise((resolve, reject) => {
			queue.push({ task, resolve, reject });
			processQueue();
		});
	};
};

export const DashboardProjectsTable = () => {
	const { projectsList } = useProjectStore();
	const [counter, setCounter] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);
	const [shouldProcess, setShouldProcess] = useState(false);

	const processProjects = useCallback(async () => {
		if (!projectsList?.length || isProcessing) return;

		setIsProcessing(true);
		const limitedRequest = rateLimit((fn) => fn(), 45); // Keep below 50 req/min limit
		const processed = new Set();

		try {
			// Process projects in batches to control rate limiting
			for (const project of projectsList) {
				if (processed.has(project.id)) continue;

				await limitedRequest(async () => {
					try {
						const { data: deployments } = await DeploymentsService.list(project.id);
						const activeDeployment = deployments?.find(
							(deployment) => deployment.state === DeploymentStateVariant.active
						);

						if (activeDeployment) {
							await DeploymentsService.deactivate(activeDeployment.deploymentId);
							await ProjectsService.delete(project.id);
						} else {
							await ProjectsService.delete(project.id);
						}

						processed.add(project.id);
						setCounter((prev) => prev + 1);
					} catch (error) {
						console.error(`Error processing project ${project.id}:`, error);
					}
				});
			}
		} finally {
			setIsProcessing(false);
		}
	}, [projectsList]);

	useEffect(() => {
		if (shouldProcess && projectsList?.length > 0) {
			processProjects();
		}
	}, [projectsList, shouldProcess, processProjects]);

	return (
		<div className="flex size-full flex-col items-center justify-center gap-4">
			{!shouldProcess ? (
				<button className="bg-red-500 rounded px-4 py-2 text-white" onClick={() => setShouldProcess(true)}>
					Delete All Projects
				</button>
			) : (
				<div className="text-xl">
					{isProcessing ? "Processing... " : "Completed: "}
					{counter} out of {projectsList?.length || 0}
				</div>
			)}
		</div>
	);
};
