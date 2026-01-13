import React, { useCallback, useEffect, useMemo, useState } from "react";

import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { LoggerService, ProjectsService } from "@services";
import { namespaces, ProjectActions, tourStepsHTMLIds } from "@src/constants";
import { DeploymentStateVariant, EventListenerName } from "@src/enums";
import { useEventListener, useProjectActions, useProjectMetadataHandler } from "@src/hooks";
import {
	useCacheStore,
	useManualRunStore,
	useModalStore,
	useProjectStore,
	useToastStore,
	useTourStore,
} from "@src/store";
import { validateEntitiesName, UserTrackingUtils } from "@src/utilities";

import { Button, IconSvg, Loader, Spinner } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";
import {
	DeleteActiveDeploymentProjectModal,
	DeleteDrainingDeploymentProjectModal,
	DeleteProjectModal,
} from "@components/organisms/modals";
import { ManualRunButtons, DuplicateProjectModal } from "@components/organisms/topbar/project";

import { BuildIcon, MoreIcon } from "@assets/image";
import { CloneIcon, ExportIcon, RocketIcon, TrashIcon } from "@assets/image/icons";

export const ProjectTopbarButtons = () => {
	const { t } = useTranslation(["projects", "buttons", "errors", "modals", "deployments"]);
	const { t: tLoadingOverlay } = useTranslation("dashboard", { keyPrefix: "loadingOverlay" });
	const { projectId } = useParams() as { projectId: string };
	const { closeModal, openModal } = useModalStore();
	const { fetchDeployments, fetchResources, isValid, deployments, projectValidationState } = useCacheStore();
	const { fetchManualRunConfiguration } = useManualRunStore();
	const { projectsList, setActionInProcess, actionInProcess } = useProjectStore();
	const projectValidationErrors = Object.values(projectValidationState).filter((error) => error.message !== "");
	const projectErrors = isValid ? "" : Object.values(projectValidationErrors).join(", ");
	const { deleteProject, downloadProjectExport, deactivateDeployment, isDeleting, isExporting, duplicateProject } =
		useProjectActions();
	const { handleMetadata } = useProjectMetadataHandler();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const [selectedActiveDeploymentId, setSelectedActiveDeploymentId] = useState<string>();
	const [isDuplicating, setIsDuplicating] = useState(false);
	const [duplicateProjectName, setDuplicateProjectName] = useState("");
	const [duplicateError, setDuplicateError] = useState<string>();

	const isBusy = isDeleting || isExporting;
	const busyMessage = isDeleting
		? tLoadingOverlay("deletingProject")
		: isExporting
			? tLoadingOverlay("exportingProject")
			: undefined;

	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);

	const handleProjectNameChange = useCallback(
		(value: string) => {
			setDuplicateProjectName(value);
			const validationError = validateEntitiesName(value, projectNamesSet);
			setDuplicateError(validationError || undefined);
		},
		[projectNamesSet]
	);
	const forceFetchDeployments = useCallback(() => {
		if (projectId) {
			fetchDeployments(projectId, true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	useEventListener(EventListenerName.refreshDeployments, forceFetchDeployments);

	const handleDuplicateSubmit = useCallback(async () => {
		if (duplicateError) return;
		if (!duplicateProjectName) {
			setDuplicateError(t("nameRequired", { ns: "modals", keyPrefix: "duplicateProject" }));
			return;
		}

		setIsDuplicating(true);
		try {
			const { error, newProjectId } = await duplicateProject(projectId!, duplicateProjectName);
			if (error) {
				addToast({ message: error, type: "error" });
				return;
			}
			navigate(`/projects/${newProjectId}/explorer`);
			addToast({
				message: t("projectSuccessDuplicated", { ns: "modals", keyPrefix: "duplicateProject" }),
				type: "success",
			});
		} finally {
			setIsDuplicating(false);
			setDuplicateProjectName("");
			setDuplicateError(undefined);
			closeModal(ModalName.duplicateProject);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [duplicateError, duplicateProjectName, projectId]);

	const handleProjectDelete = useCallback(async () => {
		try {
			if (selectedActiveDeploymentId) {
				const { error: errorDeactivateProject } = await deactivateDeployment(selectedActiveDeploymentId);

				if (errorDeactivateProject) {
					addToast({
						message: t("deploymentDeactivatedFailed", { ns: "errors" }),
						type: "error",
					});

					return;
				}
			}

			const { error: errorDeleteProject, projectName } = await deleteProject(projectId!);
			if (errorDeleteProject) {
				addToast({
					message: t("errorDeletingProject"),
					type: "error",
				});
				return;
			}

			if (!projectName) {
				addToast({
					message: t("warningDeletingProjectMissingName"),
					type: "warning",
				});
				return;
			}

			LoggerService.info(
				namespaces.projectUI,
				t("topbar.deleteProjectSuccessExtended", { projectId, projectName })
			);

			addToast({
				message: t("deleteProjectSuccess"),
				type: "success",
			});

			setTimeout(() => {
				navigate("/", { replace: true });
			}, 100);
		} catch {
			addToast({
				message: t("errorDeletingProject"),
				type: "error",
			});
			await new Promise((resolve) => setTimeout(resolve, 3000));
		} finally {
			closeModal(ModalName.deleteWithActiveDeploymentProject);
			closeModal(ModalName.deleteProject);
			setSelectedActiveDeploymentId(undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, selectedActiveDeploymentId]);

	const displayDeleteModal = useCallback(async () => {
		const deployment = deployments?.find((deployment) => deployment.state);
		if (deployment?.state === DeploymentStateVariant.active) {
			setSelectedActiveDeploymentId(deployment.deploymentId);
			const projectName = projectsList.find((project) => project.id === projectId)?.name;
			openModal(ModalName.deleteWithActiveDeploymentProject, {
				projectName: projectName,
				projectId: projectId,
			});
			return;
		}
		if (deployment?.state === DeploymentStateVariant.draining) {
			openModal(ModalName.deleteWithDrainingDeploymentProject);
			return;
		}

		openModal(ModalName.deleteProject, {
			projectName: projectsList.find((project) => project.id === projectId)?.name,
			projectId: projectId,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deployments]);

	const build = useCallback(async () => {
		const resources = await fetchResources(projectId!);
		if (!resources) {
			addToast({
				message: t("topbar.noFilesDidntBuild"),
				type: "error",
			});
			return;
		}

		try {
			setActionInProcess(ProjectActions.build, true);
			const { data: buildId, error, metadata } = await ProjectsService.build(projectId!, resources);

			if (error) {
				addToast({
					message: t("projectBuildFailed", { ns: "errors" }),
					type: "error",
				});
				return;
			}

			const { handled, message, type } = handleMetadata(metadata, "build");
			if (handled) {
				if (message && type) {
					addToast({ message, type });
				}
				if (!buildId) return;
			}

			if (!buildId) {
				addToast({
					message: t("projectBuildFailed", { ns: "errors" }),
					type: "error",
				});
				return;
			}

			await fetchDeployments(projectId!, true);

			if (!handled) {
				addToast({
					message: t("topbar.buildProjectSuccess"),
					type: "success",
				});
			}

			LoggerService.info(namespaces.projectUI, t("topbar.buildProjectSuccessExtended", { buildId }));

			if (buildId) {
				UserTrackingUtils.trackEvent("project_validated", {
					projectId,
					buildId,
				});
			}
		} finally {
			setActionInProcess(ProjectActions.build, false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const deploy = useCallback(async () => {
		const resources = await fetchResources(projectId!);
		if (!resources) return;

		try {
			setActionInProcess(ProjectActions.deploy, true);
			const { data: deploymentId, error, metadata } = await ProjectsService.run(projectId!, resources);

			if (error) {
				addToast({
					message: t("projectDeployFailed", { ns: "errors" }),
					type: "error",
				});
				return;
			}

			const { handled, message, type } = handleMetadata(metadata, "deploy");
			if (handled) {
				if (message && type) {
					addToast({ message, type });
				} else if (deploymentId) {
					addToast({
						message: t("topbar.deployedProjectSuccess"),
						type: "success",
					});
				}
			} else if (!deploymentId) {
				addToast({
					message: t("projectDeployFailed", { ns: "errors" }),
					type: "error",
				});
			} else {
				addToast({
					message: t("topbar.deployedProjectSuccess"),
					type: "success",
				});
			}

			await fetchDeployments(projectId!, true);
			const { activeTour } = useTourStore.getState();
			fetchManualRunConfiguration(projectId, activeTour?.tourId);

			LoggerService.info(namespaces.projectUI, t("topbar.deployedProjectSuccessExtended", { deploymentId }));

			if (deploymentId) {
				UserTrackingUtils.trackEvent("deployment_created", {
					deploymentId,
					projectId,
				});
			}
		} finally {
			setActionInProcess(ProjectActions.deploy, false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const debouncedBuild = useMemo(() => debounce(build, 1000, { leading: true, trailing: false }), [build]);
	const debouncedDeploy = useMemo(() => debounce(deploy, 1000, { leading: true, trailing: false }), [deploy]);

	useEffect(() => {
		return () => {
			debouncedBuild.cancel();
			debouncedDeploy.cancel();
		};
	}, [debouncedBuild, debouncedDeploy]);

	const isDeployAndBuildDisabled = Object.values(actionInProcess).some((value) => value);

	return (
		<div className="flex items-center gap-3 pr-2 maxScreenWidth-1600:gap-1.5">
			<LoadingOverlay isLoading={isBusy} message={busyMessage} />
			<PopoverWrapper interactionType="hover" placement="top">
				<PopoverTrigger>
					<Button
						ariaLabel={t("topbar.buttons.ariaBuildProject")}
						className="group h-8 whitespace-nowrap px-3.5 text-white maxScreenWidth-1600:px-2"
						disabled={isDeployAndBuildDisabled}
						onClick={debouncedBuild}
						title={isValid ? t("topbar.buttons.build") : projectErrors}
						variant="outline"
					>
						{actionInProcess[ProjectActions.build] ? (
							<Spinner className="size-4" />
						) : (
							<IconSvg
								className="stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
								size="md"
								src={BuildIcon}
							/>
						)}

						<span className="maxScreenWidth-1600:hidden">{t("topbar.buttons.build")}</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="border border-gray-700 bg-gray-900 p-1 text-xs text-white">
					{t("topbar.buttons.build")}
				</PopoverContent>
			</PopoverWrapper>

			<PopoverWrapper interactionType="hover" placement="top">
				<PopoverTrigger>
					<Button
						ariaLabel={t("topbar.buttons.ariaDeployProject")}
						className="group h-8 items-center whitespace-nowrap px-3.5 text-white maxScreenWidth-1600:px-2"
						disabled={isDeployAndBuildDisabled}
						id={tourStepsHTMLIds.deployButton}
						onClick={debouncedDeploy}
						title={isValid ? t("topbar.buttons.deploy") : projectErrors}
						variant="outline"
					>
						{actionInProcess[ProjectActions.deploy] ? (
							<Spinner className="size-4" />
						) : (
							<IconSvg
								className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
								size="md"
								src={RocketIcon}
							/>
						)}

						<span className="maxScreenWidth-1600:hidden">{t("topbar.buttons.deploy")}</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="border border-gray-700 bg-gray-900 p-1 text-xs text-white">
					{t("topbar.buttons.deploy")}
				</PopoverContent>
			</PopoverWrapper>

			<ManualRunButtons />

			<PopoverWrapper interactionType="hover" placement="bottom">
				<PopoverTrigger>
					<Button
						ariaLabel={t("topbar.buttons.projectActionsMenu")}
						className="group h-8 whitespace-nowrap px-4 text-white maxScreenWidth-1600:px-2"
						title={t("topbar.buttons.projectActionsMenu")}
						variant="outline"
					>
						<IconSvg
							className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
							size="md"
							src={MoreIcon}
						/>

						<span className="maxScreenWidth-1600:hidden">{t("more", { ns: "buttons" })}</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="flex flex-col gap-2 border border-gray-700 bg-gray-900 p-2">
					<Button
						ariaLabel={t("topbar.buttons.export")}
						className="group h-8 w-full px-4 text-white"
						onClick={() => downloadProjectExport(projectId!)}
						variant="outline"
					>
						{isExporting ? (
							<Loader size="sm" />
						) : (
							<IconSvg
								className="stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
								size="md"
								src={ExportIcon}
							/>
						)}
						<div className="mt-0.5">{t("topbar.buttons.export")}</div>
					</Button>
					<Button
						ariaLabel={t("topbar.buttons.duplicate")}
						className="group h-8 w-full px-4 text-white"
						onClick={() => openModal(ModalName.duplicateProject)}
						variant="outline"
					>
						<IconSvg className="fill-white group-hover:fill-green-200" size="md" src={CloneIcon} />
						<div className="mt-0.5">{t("topbar.buttons.duplicate")}</div>
					</Button>
					<Button
						ariaLabel={t("topbar.buttons.deleteProject")}
						className="group h-8 w-full px-4 text-white"
						onClick={displayDeleteModal}
						title={t("topbar.buttons.deleteProject")}
						variant="outline"
					>
						<IconSvg
							className="stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
							size="md"
							src={TrashIcon}
						/>

						<div className="mt-0.5">{t("topbar.buttons.delete")}</div>
					</Button>
				</PopoverContent>
			</PopoverWrapper>

			<DeleteDrainingDeploymentProjectModal />
			<DeleteActiveDeploymentProjectModal isDeleting={isDeleting} onDelete={handleProjectDelete} />
			<DeleteProjectModal isDeleting={isDeleting} onDelete={handleProjectDelete} />
			<DuplicateProjectModal
				error={duplicateError}
				isLoading={isDuplicating}
				onProjectNameChange={handleProjectNameChange}
				onSubmit={handleDuplicateSubmit}
			/>
		</div>
	);
};
