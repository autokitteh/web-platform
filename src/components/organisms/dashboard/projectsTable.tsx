import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { namespaces } from "@constants";
import { DeploymentStateVariant, ModalName } from "@enums";
import { LoggerService, DeploymentsService } from "@services";
import { DashboardProjectWithStats, Project } from "@type/models";
import { calculateDeploymentSessionsStats } from "@utilities";

import { useProjectActions, useSort } from "@hooks";
import { useModalStore, useProjectStore, useToastStore } from "@store";

import { TBody, Table } from "@components/atoms";
import { DashboardProjectsTableHeader, DashboardProjectsTableRow } from "@components/organisms/dashboard";
import {
	DeleteProjectModal,
	DeleteActiveDeploymentProjectModal,
	DeleteDrainingDeploymentProjectModal,
} from "@components/organisms/modals";

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { t: tDeployments } = useTranslation("deployments");
	const { t: tProjects } = useTranslation("projects");
	const { projectsList } = useProjectStore();
	const [projectsStats, setProjectsStats] = useState<Record<string, DashboardProjectWithStats>>({});
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const [failedProjects, setFailedProjects] = useState<Set<string>>(new Set());
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal, openModal } = useModalStore();

	const projectsWithStats = useMemo(() => {
		return projectsList.map((project) => {
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
	}, [projectsList, projectsStats]);

	const {
		items: sortedProjectsStats,
		requestSort,
		sortConfig,
	} = useSort<DashboardProjectWithStats>(projectsWithStats, "name");
	const { deleteProject, downloadProjectExport, isDeleting, deactivateDeployment } = useProjectActions();
	const [selectedProjectForDeletion, setSelectedProjectForDeletion] = useState<{
		activeDeploymentId?: string;
		projectId?: string;
	}>({
		projectId: undefined,
		activeDeploymentId: undefined,
	});

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

	const fetchProjectStats = async (
		project: Project
	): Promise<{
		error?: boolean;
		projectId: string;
		stats: DashboardProjectWithStats | null;
	}> => {
		try {
			const { data: deployments } = await DeploymentsService.list(project.id);
			let projectStatus = DeploymentStateVariant.inactive;
			let deploymentId = "";
			const lastDeployed = deployments?.[deployments?.length - 1]?.createdAt;
			const { sessionStats, totalDeployments } = calculateDeploymentSessionsStats(deployments || []);

			deployments?.forEach((deployment) => {
				if (deployment.state === DeploymentStateVariant.active) {
					projectStatus = DeploymentStateVariant.active;
					deploymentId = deployment.deploymentId;
				} else if (
					deployment.state === DeploymentStateVariant.draining &&
					projectStatus !== DeploymentStateVariant.active
				) {
					projectStatus = DeploymentStateVariant.draining;
				}
			});

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
			};
		} catch {
			return {
				projectId: project.id,
				stats: null,
				error: true,
			};
		}
	};

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
				return;
			}

			setIsLoadingStats(true);
			setProjectsStats({});
			setFailedProjects(new Set());

			const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name));

			const batchSize = 5;
			const batches: Project[][] = [];
			for (let i = 0; i < sortedProjects.length; i += batchSize) {
				batches.push(sortedProjects.slice(i, i + batchSize));
			}

			let hasShownErrorToast = false;

			for (const batch of batches) {
				if (signal.aborted) return;

				const batchResults = await Promise.all(batch.map(fetchProjectStats));

				if (signal.aborted) return;

				const failedInBatch: string[] = [];

				setProjectsStats((prev) => {
					const updated = { ...prev };
					batchResults.forEach(({ projectId, stats, error }) => {
						if (stats && !error) {
							updated[projectId] = stats;
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
			}
		},
		[addToast, t, waitForNextFrame]
	);

	const handelDeactivateDeployment = useCallback(
		async (deploymentId: string) => {
			const { error, deploymentById } = await deactivateDeployment(deploymentId);

			if (error) {
				addToast({
					message: tDeployments("deploymentDeactivatedFailed"),
					type: "error",
				});

				return;
			}

			setProjectsStats((prevStats) => {
				const updatedStats = { ...prevStats };
				for (const projectId in updatedStats) {
					if (updatedStats[projectId].deploymentId === deploymentId) {
						updatedStats[projectId] = {
							...updatedStats[projectId],
							status: deploymentById?.state || DeploymentStateVariant.unspecified,
						};
					}
				}
				return updatedStats;
			});

			addToast({
				message: tDeployments("history.actions.deploymentDeactivatedSuccessfully"),
				type: "success",
			});
			LoggerService.info(
				namespaces.ui.deployments,
				tDeployments("history.actions.deploymentDeactivatedSuccessfullyExtended", { deploymentId })
			);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	useEffect(() => {
		loadProjectsData(projectsList);

		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [loadProjectsData, projectsList]);

	const handleProjectDelete = async () => {
		try {
			const { activeDeploymentId, projectId } = selectedProjectForDeletion;
			if (activeDeploymentId) {
				const { error: errorDeactivateProject } = await deactivateDeployment(activeDeploymentId);
				if (errorDeactivateProject) {
					addToast({
						message: tDeployments("deploymentDeactivatedFailed"),
						type: "error",
					});
					return;
				}
			}
			const { error: errorDeleteProject } = await deleteProject(projectId!);
			if (errorDeleteProject) {
				addToast({
					message: tProjects("errorDeletingProject"),
					type: "error",
				});
				return;
			}

			addToast({
				message: tProjects("deleteProjectSuccess"),
				type: "success",
			});
		} catch {
			addToast({
				message: t("errorDeletingProject"),
				type: "error",
			});
		} finally {
			closeModal(ModalName.deleteWithActiveDeploymentProject);
			closeModal(ModalName.deleteProject);
			setSelectedProjectForDeletion({ activeDeploymentId: undefined, projectId: undefined });
		}
	};

	const displayDeleteModal = async (
		status: DeploymentStateVariant,
		deploymentId: string,
		projectId: string,
		name: string
	) => {
		if (status === DeploymentStateVariant.active) {
			setSelectedProjectForDeletion({ activeDeploymentId: deploymentId, projectId });
			openModal(ModalName.deleteWithActiveDeploymentProject);
			return;
		}
		if (status === DeploymentStateVariant.draining) {
			openModal(ModalName.deleteWithDrainingDeploymentProject);
			return;
		}

		setSelectedProjectForDeletion({ projectId });
		openModal(ModalName.deleteProject, name);
	};

	return (
		<div className="z-10 h-1/2 select-none pt-10 md:h-2/3 xl:h-3/4 3xl:h-4/5">
			{sortedProjectsStats.length ? (
				<Table className="mt-2.5 h-auto max-h-full rounded-t-20">
					<DashboardProjectsTableHeader requestSort={requestSort} sortConfig={sortConfig} />

					<TBody className="mr-0">
						{sortedProjectsStats.map((project) => (
							<DashboardProjectsTableRow
								key={project.id}
								{...project}
								displayDeleteModal={displayDeleteModal}
								downloadProjectExport={downloadProjectExport}
								handelDeactivateDeployment={handelDeactivateDeployment}
								hasLoadError={failedProjects.has(project.id)}
								isLoadingStats={Boolean(isLoadingStats && !(project.id in projectsStats))}
							/>
						))}
					</TBody>
				</Table>
			) : (
				<div>{t("table.noProjectsFound")}</div>
			)}
			<DeleteDrainingDeploymentProjectModal />
			<DeleteActiveDeploymentProjectModal isDeleting={isDeleting} onDelete={handleProjectDelete} />
			<DeleteProjectModal isDeleting={isDeleting} onDelete={handleProjectDelete} />
		</div>
	);
};
