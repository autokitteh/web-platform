import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { namespaces } from "@constants";
import { DeploymentStateVariant, ModalName } from "@enums";
import { LoggerService, DeploymentsService } from "@services";
import { DashboardProjectWithStats, Project } from "@type/models";
import { calculateDeploymentSessionsStats } from "@utilities";

import { useProjectActions, useSort } from "@hooks";
import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Loader, TBody, Table } from "@components/atoms";
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
	const navigate = useNavigate();
	const [projectsStats, setProjectsStats] = useState<DashboardProjectWithStats[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal, openModal } = useModalStore();

	const {
		items: sortedProjectsStats,
		requestSort,
		sortConfig,
	} = useSort<DashboardProjectWithStats>(projectsStats, "name");
	const { deleteProject, downloadProjectExport, isDeleting, deactivateDeployment } = useProjectActions();
	const [selectedProjectForDeletion, setSelectedProjectForDeletion] = useState<{
		activeDeploymentId?: string;
		projectId?: string;
	}>({
		projectId: undefined,
		activeDeploymentId: undefined,
	});

	const loadProjectsData = async (projectsList: Project[]) => {
		const projectsStats = {} as Record<string, DashboardProjectWithStats>;
		setIsLoading(true);
		for (const project of projectsList) {
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

			projectsStats[project.id] = {
				id: project.id,
				name: project.name,
				totalDeployments,
				...sessionStats,
				status: projectStatus,
				lastDeployed,
				deploymentId,
			};
		}
		setProjectsStats(Object.values(projectsStats));
		setIsLoading(false);
	};

	const handelDeactivateDeployment = useCallback(async (deploymentId: string) => {
		const { error, deploymentById } = await deactivateDeployment(deploymentId);

		if (error) {
			addToast({
				message: tDeployments("deploymentDeactivatedFailed"),
				type: "error",
			});

			return;
		}

		setProjectsStats((prevStats) =>
			prevStats.map((project) =>
				project.deploymentId === deploymentId
					? { ...project, status: deploymentById?.state || DeploymentStateVariant.unspecified }
					: project
			)
		);

		addToast({
			message: tDeployments("history.actions.deploymentDeactivatedSuccessfully"),
			type: "success",
		});
		LoggerService.info(
			namespaces.ui.deployments,
			tDeployments("history.actions.deploymentDeactivatedSuccessfullyExtended", { deploymentId })
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		loadProjectsData(projectsList);
	}, [projectsList]);

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

	return isLoading ? (
		<Loader isCenter />
	) : (
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
								navigate={navigate}
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
