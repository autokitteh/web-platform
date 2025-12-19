import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { ActivityState } from "@constants/activities.constants";
import { DeploymentStateVariant } from "@enums";
import { DeploymentsService } from "@services";
import { DashboardProjectWithStats, Project } from "@type/models";
import { ActiveDeploymentData } from "@type/stores";
import { calculateDeploymentSessionsStats } from "@utilities";

import { useProjectStore, useToastStore, useDashboardStatisticsStore } from "@store";

export interface UseProjectsStatsReturn {
	projectsStats: Record<string, DashboardProjectWithStats>;
	isLoadingStats: boolean;
	failedProjects: Set<string>;
	updateProjectStatus: (deploymentId: string, status: DeploymentStateVariant) => void;
	projectsWithStats: DashboardProjectWithStats[];
}

interface FetchProjectStatsResult {
	activeDeploymentData?: ActiveDeploymentData;
	error?: boolean;
	projectId: string;
	stats: DashboardProjectWithStats | null;
}

const fetchProjectStats = async (project: Project): Promise<FetchProjectStatsResult> => {
	try {
		const { data: deployments } = await DeploymentsService.list(project.id);
		let projectStatus: DeploymentStateVariant = DeploymentStateVariant.inactive;
		let deploymentId = "";
		let activeDeploymentData: ActiveDeploymentData | undefined;
		const lastDeployed = deployments?.[deployments?.length - 1]?.createdAt;
		const { sessionStats, totalDeployments } = calculateDeploymentSessionsStats(deployments || []);

		for (const deployment of deployments || []) {
			if (deployment.state === DeploymentStateVariant.active) {
				projectStatus = DeploymentStateVariant.active;
				deploymentId = deployment.deploymentId;

				activeDeploymentData = {
					deploymentId: deployment.deploymentId,
					projectName: project.name,
					projectId: project.id,
					createdAt: deployment.createdAt,
				};
			} else if (
				deployment.state === DeploymentStateVariant.draining &&
				projectStatus !== DeploymentStateVariant.active
			) {
				projectStatus = DeploymentStateVariant.draining;
			}
		}

		return {
			projectId: project.id,
			stats: {
				id: project.id,
				name: project.name,
				totalDeployments,
				...sessionStats,
				status: projectStatus,
				lastDeployed,
				deploymentId,
			},
			activeDeploymentData,
		};
	} catch {
		return {
			projectId: project.id,
			stats: null,
			error: true,
		};
	}
};

export const useProjectsStats = (): UseProjectsStatsReturn => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { projectsList } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);

	const {
		setStatistics,
		setActiveDeployments,
		setSessionStatusData,
		setIsLoading: setStatsLoading,
		refreshTrigger,
	} = useDashboardStatisticsStore();

	const [projectsStats, setProjectsStats] = useState<Record<string, DashboardProjectWithStats>>({});
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const [failedProjects, setFailedProjects] = useState<Set<string>>(new Set());
	const abortControllerRef = useRef<AbortController | null>(null);

	const waitForNextFrame = useCallback(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => {
					setTimeout(resolve, 50);
				});
			}),
		[]
	);

	const loadProjectsData = useCallback(
		async (projects: Project[]) => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			abortControllerRef.current = new AbortController();
			const { signal } = abortControllerRef.current;

			if (!projects.length) {
				setProjectsStats({});
				setFailedProjects(new Set());
				setIsLoadingStats(false);
				setStatsLoading(false);
				setStatistics({
					totalProjects: 0,
					activeProjects: 0,
					totalDeployments: 0,
					activeDeployments: 0,
					sessionsByStatus: { completed: 0, running: 0, error: 0, stopped: 0, created: 0 },
				});
				setActiveDeployments([]);
				setSessionStatusData([
					{ status: ActivityState.completed, count: 0 },
					{ status: ActivityState.running, count: 0 },
					{ status: ActivityState.error, count: 0 },
					{ status: ActivityState.stopped, count: 0 },
					{ status: ActivityState.created, count: 0 },
				]);

				return;
			}

			setIsLoadingStats(true);
			setStatsLoading(true);
			setProjectsStats({});
			setFailedProjects(new Set());

			const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name));

			const batchSize = 5;
			const batches: Project[][] = [];
			for (let i = 0; i < sortedProjects.length; i += batchSize) {
				batches.push(sortedProjects.slice(i, i + batchSize));
			}

			let hasShownErrorToast = false;
			const allActiveDeployments: ActiveDeploymentData[] = [];
			let totalDeploymentsCount = 0;
			let activeDeploymentsCount = 0;
			let activeProjectsCount = 0;
			const aggregatedSessions = { completed: 0, running: 0, error: 0, stopped: 0, created: 0 };

			for (const batch of batches) {
				if (signal.aborted) return;

				const batchResults = await Promise.all(batch.map(fetchProjectStats));

				if (signal.aborted) return;

				const failedInBatch: string[] = [];

				setProjectsStats((prev) => {
					const updated = { ...prev };
					batchResults.forEach(({ projectId, stats, error, activeDeploymentData }) => {
						if (stats && !error) {
							updated[projectId] = stats;
							totalDeploymentsCount += stats.totalDeployments;
							aggregatedSessions.completed += stats.completed;
							aggregatedSessions.running += stats.running;
							aggregatedSessions.error += stats.error;
							aggregatedSessions.stopped += stats.stopped;

							if (stats.status === DeploymentStateVariant.active) {
								activeProjectsCount++;
								activeDeploymentsCount++;
								if (activeDeploymentData) {
									allActiveDeployments.push(activeDeploymentData);
								}
							}
						} else if (error) {
							failedInBatch.push(projectId);
						}
					});

					return updated;
				});

				if (failedInBatch.length > 0) {
					setFailedProjects((prev) => {
						const updated = new Set(prev);
						failedInBatch.forEach((id) => updated.add(id));

						return updated;
					});

					if (!hasShownErrorToast) {
						hasShownErrorToast = true;
						addToast({
							message: t("errors.failedToLoadStats"),
							type: "error",
						});
					}
				}

				await waitForNextFrame();
			}

			if (!signal.aborted) {
				setIsLoadingStats(false);
				setStatsLoading(false);
				setStatistics({
					totalProjects: projects.length,
					activeProjects: activeProjectsCount,
					totalDeployments: totalDeploymentsCount,
					activeDeployments: activeDeploymentsCount,
					sessionsByStatus: aggregatedSessions,
				});
				setActiveDeployments(allActiveDeployments);
				setSessionStatusData([
					{ status: ActivityState.completed, count: aggregatedSessions.completed },
					{ status: ActivityState.running, count: aggregatedSessions.running },
					{ status: ActivityState.error, count: aggregatedSessions.error },
					{ status: ActivityState.stopped, count: aggregatedSessions.stopped },
					{ status: ActivityState.created, count: aggregatedSessions.created },
				]);
			}
		},
		[addToast, t, waitForNextFrame, setStatsLoading, setStatistics, setActiveDeployments, setSessionStatusData]
	);

	const updateProjectStatus = useCallback((deploymentId: string, status: DeploymentStateVariant) => {
		setProjectsStats((prevStats) => {
			const updatedStats = { ...prevStats };
			for (const projectId in updatedStats) {
				if (updatedStats[projectId].deploymentId === deploymentId) {
					updatedStats[projectId] = {
						...updatedStats[projectId],
						status,
					};
				}
			}

			return updatedStats;
		});
	}, []);

	useEffect(() => {
		loadProjectsData(projectsList);

		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [loadProjectsData, projectsList, refreshTrigger]);

	const projectsWithStats: DashboardProjectWithStats[] = projectsList.map((project) => {
		const stats = projectsStats[project.id];

		return (
			stats || {
				id: project.id,
				name: project.name,
				totalDeployments: 0,
				running: 0,
				stopped: 0,
				completed: 0,
				error: 0,
				status: DeploymentStateVariant.inactive,
				lastDeployed: undefined,
				deploymentId: "",
			}
		);
	});

	return {
		projectsStats,
		isLoadingStats,
		failedProjects,
		updateProjectStatus,
		projectsWithStats,
	};
};
