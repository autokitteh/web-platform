import { KeyboardEvent, MouseEvent, useCallback, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { namespaces } from "@constants";
import { DeploymentStateVariant, ModalName, SessionStateType } from "@enums";
import { SidebarHrefMenu } from "@enums/components";
import { ProjectsTableMeta } from "@interfaces/components";
import { LoggerService } from "@services";
import { DashboardProjectWithStats } from "@type/models";
import { useNavigateWithSettings } from "@utilities/navigation";

import { useProjectActions } from "@hooks";
import { useModalStore, useToastStore } from "@store";

export interface UseProjectsTableActionsParams {
	projectsStats: Record<string, DashboardProjectWithStats>;
	isLoadingStats: boolean;
	failedProjects: Set<string>;
	updateProjectStatus: (deploymentId: string, status: DeploymentStateVariant) => void;
}

export interface UseProjectsTableActionsReturn {
	selectedProjectForDeletion: { activeDeploymentId?: string; projectId?: string };
	handleProjectDelete: () => Promise<void>;
	displayDeleteModal: (status: DeploymentStateVariant, deploymentId: string, projectId: string, name: string) => void;
	handleRowClick: (projectId: string) => void;
	tableMeta: ProjectsTableMeta;
	isDeleting: boolean;
}

export const useProjectsTableActions = ({
	projectsStats,
	isLoadingStats,
	failedProjects,
	updateProjectStatus,
}: UseProjectsTableActionsParams): UseProjectsTableActionsReturn => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { t: tDeployments } = useTranslation("deployments");
	const { t: tProjects } = useTranslation("projects");

	const addToast = useToastStore((state) => state.addToast);
	const { closeModal, openModal } = useModalStore();
	const navigateWithSettings = useNavigateWithSettings();

	const { deleteProject, downloadProjectExport, isDeleting, deactivateDeployment } = useProjectActions();
	const [selectedProjectForDeletion, setSelectedProjectForDeletion] = useState<{
		activeDeploymentId?: string;
		projectId?: string;
	}>({
		projectId: undefined,
		activeDeploymentId: undefined,
	});

	const handleDeactivateDeployment = useCallback(
		async (deploymentId: string) => {
			const { error, deploymentById } = await deactivateDeployment(deploymentId);

			if (error) {
				addToast({
					message: tDeployments("deploymentDeactivatedFailed"),
					type: "error",
				});

				return;
			}

			updateProjectStatus(deploymentId, deploymentById?.state || DeploymentStateVariant.unspecified);

			addToast({
				message: tDeployments("history.actions.deploymentDeactivatedSuccessfully"),
				type: "success",
			});
			LoggerService.info(
				namespaces.ui.deployments,
				tDeployments("history.actions.deploymentDeactivatedSuccessfullyExtended", { deploymentId })
			);
		},
		[addToast, deactivateDeployment, tDeployments, updateProjectStatus]
	);

	const handleProjectDelete = useCallback(async () => {
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
	}, [
		selectedProjectForDeletion,
		deactivateDeployment,
		deleteProject,
		addToast,
		tDeployments,
		tProjects,
		t,
		closeModal,
	]);

	const displayDeleteModal = useCallback(
		(status: DeploymentStateVariant, deploymentId: string, projectId: string, name: string) => {
			if (status === DeploymentStateVariant.active) {
				setSelectedProjectForDeletion({ activeDeploymentId: deploymentId, projectId });
				openModal(ModalName.deleteWithActiveDeploymentProject, {
					projectName: name,
					projectId: projectId,
				});

				return;
			}
			if (status === DeploymentStateVariant.draining) {
				openModal(ModalName.deleteWithDrainingDeploymentProject);

				return;
			}

			setSelectedProjectForDeletion({ projectId });
			openModal(ModalName.deleteProject, {
				projectName: name,
				projectId: projectId,
			});
		},
		[openModal]
	);

	const handleOpenProjectFilteredSessions = useCallback(
		(
			event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
			projectId: string,
			sessionState: keyof typeof SessionStateType
		) => {
			event.stopPropagation();
			navigateWithSettings(`/${SidebarHrefMenu.projects}/${projectId}/sessions`, {
				state: { sessionState },
			});
		},
		[navigateWithSettings]
	);

	const handleRowClick = useCallback(
		(projectId: string) => {
			navigateWithSettings(`/${SidebarHrefMenu.projects}/${projectId}`);
		},
		[navigateWithSettings]
	);

	const tableMeta: ProjectsTableMeta = useMemo(
		() => ({
			isLoadingStats: (projectId: string) => Boolean(isLoadingStats && !(projectId in projectsStats)),
			hasLoadError: (projectId: string) => failedProjects.has(projectId),
			onDeactivate: handleDeactivateDeployment,
			onExport: downloadProjectExport,
			onDelete: displayDeleteModal,
			onSessionClick: handleOpenProjectFilteredSessions,
		}),
		[
			isLoadingStats,
			projectsStats,
			failedProjects,
			handleDeactivateDeployment,
			downloadProjectExport,
			displayDeleteModal,
			handleOpenProjectFilteredSessions,
		]
	);

	return {
		selectedProjectForDeletion,
		handleProjectDelete,
		displayDeleteModal,
		handleRowClick,
		tableMeta,
		isDeleting,
	};
};
