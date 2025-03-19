import React, { useEffect, useState, useCallback } from "react";

import { ProjectsService } from "@services";
import { DeploymentsService } from "@services/deployments.service";
import { LoggerService } from "@services/logger.service";
import { DeploymentStateVariant } from "@src/enums";

import { useProjectStore } from "@store";

const RATE_LIMIT_DELAY = 60000; // 1 minute in milliseconds
const QUEUE_LIMIT = 40; // Keep well below the 50 req/min limit

// Enhanced rate limiter that handles 429 responses
const createRateLimiter = (limit = QUEUE_LIMIT) => {
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
			// Check if rate limited (status 429)
			if (error?.code === "RESOURCE_EXHAUSTED" || error?.message?.includes("429") || error?.statusCode === 429) {
				console.warn("Rate limited! Pausing queue for 1 minute...");
				// Put the task back at the front of the queue
				queue.unshift({ task, resolve, reject });

				// Pause the entire queue processing for the cooldown period
				await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY));
			} else {
				reject(error);
			}
		} finally {
			activeCount--;
			// Small delay between requests to avoid bursts
			setTimeout(processQueue, 100);
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
	const [errorCount, setErrorCount] = useState(0);

	const processProjects = useCallback(async () => {
		if (!projectsList?.length || isProcessing) return;

		setIsProcessing(true);
		const limitedRequest = createRateLimiter();
		const processed = new Set();
		const errors = new Set();

		try {
			for (const project of projectsList) {
				if (processed.has(project.id)) continue;

				await limitedRequest(async () => {
					try {
						LoggerService.debug("Processing project", `Starting deletion of project ${project.id}`);

						// First check if project exists to avoid unnecessary calls
						const { data: projectData, error: getError } = await ProjectsService.get(project.id);
						if (getError || !projectData) {
							LoggerService.error(
								"Project deletion",
								`Project ${project.id} not found or error: ${getError?.message}`
							);
							processed.add(project.id);
							setCounter((prev) => prev + 1);
							return;
						}

						// Get deployments and deactivate any active ones
						const { data: deployments, error: deploymentError } = await DeploymentsService.list(project.id);

						if (deploymentError) {
							LoggerService.error(
								"Project deletion",
								`Failed to get deployments for ${project.id}: ${deploymentError.message}`
							);
							errors.add(project.id);
							setErrorCount((prev) => prev + 1);
							return;
						}

						const activeDeployment = deployments?.find(
							(deployment) => deployment.state === DeploymentStateVariant.active
						);

						if (activeDeployment) {
							const { error: deactivateError } = await DeploymentsService.deactivate(
								activeDeployment.deploymentId
							);

							if (deactivateError) {
								LoggerService.error(
									"Project deletion",
									`Failed to deactivate deployment for ${project.id}: ${deactivateError.message}`
								);
								errors.add(project.id);
								setErrorCount((prev) => prev + 1);
								return;
							}
						}

						// Finally delete the project
						const { error: deleteError } = await ProjectsService.delete(project.id);

						if (deleteError) {
							LoggerService.error(
								"Project deletion",
								`Failed to delete project ${project.id}: ${deleteError.message}`
							);
							errors.add(project.id);
							setErrorCount((prev) => prev + 1);
						} else {
							LoggerService.debug("Project deletion", `Successfully deleted project ${project.id}`);
							processed.add(project.id);
							setCounter((prev) => prev + 1);
						}
					} catch (error) {
						LoggerService.error("Project deletion", `Unexpected error for ${project.id}: ${error.message}`);
						errors.add(project.id);
						setErrorCount((prev) => prev + 1);
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
				<button
					className="bg-red-500 hover:bg-red-600 rounded px-4 py-2 text-white"
					onClick={() => setShouldProcess(true)}
				>
					Delete All Projects
				</button>
			) : (
				<div className="flex flex-col items-center">
					<div className="mb-4 text-xl">
						{isProcessing ? "Processing... " : "Completed: "}
						{counter} out of {projectsList?.length || 0}
					</div>

					{errorCount > 0 ? (
						<div className="text-red-500 mt-2">Failed to process {errorCount} projects</div>
					) : null}

					{!isProcessing && counter < (projectsList?.length || 0) ? (
						<button
							className="hover:bg-blue-600 mt-4 rounded bg-blue-500 px-4 py-2 text-white"
							onClick={() => processProjects()}
						>
							Retry Failed
						</button>
					) : null}
				</div>
			)}
		</div>
	);
};
