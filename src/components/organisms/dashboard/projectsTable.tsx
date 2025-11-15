/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import React, { useEffect, useState, useCallback } from "react";

import { Code } from "@connectrpc/connect";

import { deploymentsClient, projectsClient } from "@api/grpc/clients.grpc.api";
import { LoggerService } from "@services/logger.service";
import { DeploymentState } from "@src/autokitteh/proto/gen/ts/autokitteh/deployments/v1/deployment_pb";

import { useProjectStore } from "@store";

const RATE_LIMIT_DELAY = 60000; // 1 minute in milliseconds
const QUEUE_LIMIT = 20; // Keep well below the 20 req/min limit

// Define proper types for the rate limiter
interface QueueItem<T> {
	task: () => Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: any) => void;
}

// Enhanced rate limiter that handles 429 responses
const createRateLimiter = <T,>(limit = QUEUE_LIMIT) => {
	const queue: QueueItem<T>[] = [];
	let activeCount = 0;

	const processQueue = async (): Promise<void> => {
		if (queue.length === 0 || activeCount >= limit) return;

		activeCount++;
		const { task, resolve, reject } = queue.shift()!;

		try {
			const result = await task();
			resolve(result);
		} catch (error: any) {
			console.log("Error", JSON.stringify(error));

			// Check if rate limited (status 429)
			if (
				error?.code === "RESOURCE_EXHAUSTED" ||
				error?.message?.includes("429") ||
				error?.statusCode === 429 ||
				error?.code === Code.ResourceExhausted ||
				error?.code === Code.Unknown ||
				error?.statusCode === Code.ResourceExhausted
			) {
				console.warn("Rate limited! Pausing queue for 1 minute...");
				// Put the task back at the front of the queue
				queue.unshift({ task, resolve, reject });

				// Pause the entire queue processing for the cooldown period
				await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
			} else {
				reject(error);
			}
		} finally {
			activeCount--;
			// Small delay between requests to avoid bursts
			setTimeout(processQueue, 100);
		}
	};

	return (task: () => Promise<T>): Promise<T> => {
		return new Promise<T>((resolve, reject) => {
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
		const limitedRequest = createRateLimiter<any>();
		const processed = new Set<string>();
		const errors = new Set<string>();

		// Helper function to check if error is rate limit related
		function isRateLimitError(error: any): boolean {
			return (
				error?.code === "RESOURCE_EXHAUSTED" ||
				error?.message?.includes("429") ||
				error?.statusCode === 429 ||
				error?.code === Code.ResourceExhausted ||
				error?.code === Code.Unknown ||
				error?.statusCode === Code.ResourceExhausted
			);
		}

		try {
			for (const project of projectsList) {
				if (processed.has(project.id)) continue;

				await limitedRequest(async () => {
					try {
						LoggerService.debug("Processing project", `Starting deletion of project ${project.id}`);

						// First check if project exists to avoid unnecessary calls
						await projectsClient.get({
							projectId: project.id,
						});

						// Get deployments and deactivate any active ones
						const { deployments } = await deploymentsClient.list({
							projectId: project.id,
						});

						const activeDeployment = deployments?.find(
							(deployment) => deployment.state === DeploymentState.ACTIVE
						);

						if (activeDeployment) {
							await deploymentsClient.deactivate({ deploymentId: activeDeployment.deploymentId });
						}

						// Finally delete the project
						await projectsClient.delete({ projectId: project.id });

						LoggerService.debug("Project deletion", `Successfully deleted project ${project.id}`);
						processed.add(project.id);
						setCounter((prev) => prev + 1);
					} catch (error: any) {
						console.log("Error in task", JSON.stringify(error));

						// If it's a rate limit error, re-throw to let the rate limiter handle it
						if (isRateLimitError(error)) {
							throw error;
						}

						// Otherwise handle locally
						LoggerService.error("Project deletion", `Unexpected error for ${project.id}: ${error.message}`);
						errors.add(project.id);
						setErrorCount((prev) => prev + 1);
					}
				});
			}
		} finally {
			setIsProcessing(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
					className="rounded bg-black px-4 py-2 text-white hover:bg-red"
					onClick={() => setShouldProcess(true)}
				>
					Delete All Projects
				</button>
			) : (
				<div className="flex flex-col items-center bg-blue-500 p-20 text-black">
					<div className="mb-4 text-xl">
						{isProcessing ? "Processing... " : "Completed: "}
						{counter} out of {projectsList?.length || 0}
					</div>

					{errorCount > 0 ? (
						<div className="mt-2 bg-black text-red">Failed to process {errorCount} projects</div>
					) : null}

					{!isProcessing && counter < (projectsList?.length || 0) ? (
						<button className="mt-4 rounded bg-red px-4 py-2 text-white" onClick={() => processProjects()}>
							Retry Failed
						</button>
					) : null}
				</div>
			)}
		</div>
	);
};
