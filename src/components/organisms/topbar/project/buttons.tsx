import React, { useCallback, useEffect, useMemo, useState } from "react";

import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { namespaces, tourStepsHTMLIds } from "@constants";
import { DeploymentStateVariant, ProjectActions } from "@enums";
import { ModalName } from "@enums/components";
import { LoggerService, ProjectsService } from "@services";
import { validateEntitiesName } from "@utilities";

import { useProjectActions } from "@hooks";
import { useCacheStore, useManualRunStore, useModalStore, useProjectStore, useToastStore, useTourStore } from "@store";

import { Button, IconSvg, Loader, Spinner } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import {
	DeleteActiveDeploymentProjectModal,
	DeleteDrainingDeploymentProjectModal,
	DeleteProjectModal,
} from "@components/organisms/modals";
import { ManualRunButtons, DuplicateProjectModal } from "@components/organisms/topbar/project";

import { BuildIcon, MoreIcon } from "@assets/image";
import { CloneIcon, EventsFlag, ExportIcon, RocketIcon, TrashIcon } from "@assets/image/icons";

export const ProjectTopbarButtons = () => {
	const { t } = useTranslation(["projects", "buttons", "errors", "modals"]);
	const { projectId } = useParams() as { projectId: string };
	const { closeModal, openModal } = useModalStore();
	const { fetchDeployments, fetchResources, isValid, deployments, projectValidationState } = useCacheStore();
	const { fetchManualRunConfiguration } = useManualRunStore();
	const { projectsList, setActionInProcess, actionInProcess } = useProjectStore();
	const projectValidationErrors = Object.values(projectValidationState).filter((error) => error.message !== "");
	const projectErrors = isValid ? "" : Object.values(projectValidationErrors).join(", ");
	const { deleteProject, downloadProjectExport, deactivateDeployment, isDeleting, isExporting, duplicateProject } =
		useProjectActions();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const [selectedActiveDeploymentId, setSelectedActiveDeploymentId] = useState<string>();
	const [isDuplicating, setIsDuplicating] = useState(false);
	const [duplicateProjectName, setDuplicateProjectName] = useState("");
	const [duplicateError, setDuplicateError] = useState<string>();

	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);

	const handleProjectNameChange = useCallback(
		(value: string) => {
			setDuplicateProjectName(value);
			const validationError = validateEntitiesName(value, projectNamesSet);
			setDuplicateError(validationError || undefined);
		},
		[projectNamesSet]
	);

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
			navigate(`/projects/${newProjectId}/code`);
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

			const { error: errorDeleteProject } = await deleteProject(projectId!);
			if (errorDeleteProject) {
				addToast({
					message: t("errorDeletingProject"),
					type: "error",
				});
				return;
			}

			addToast({
				message: t("deleteProjectSuccess"),
				type: "success",
			});
			navigate("/");
		} catch {
			addToast({
				message: t("errorDeletingProject"),
				type: "error",
			});
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
			openModal(ModalName.deleteWithActiveDeploymentProject);
			return;
		}
		if (deployment?.state === DeploymentStateVariant.draining) {
			openModal(ModalName.deleteWithDrainingDeploymentProject);
			return;
		}

		openModal(ModalName.deleteProject);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deployments]);

	const build = useCallback(async () => {
		const resources = await fetchResources(projectId!);
		if (!resources) return;

		try {
			setActionInProcess(ProjectActions.build, true);

			const { data: buildId, error } = await ProjectsService.build(projectId!, resources);
			if (error) {
				addToast({
					message: t("projectBuildFailed", { ns: "errors" }),
					type: "error",
				});

				return;
			}
			fetchDeployments(projectId!, true);
			addToast({
				message: t("topbar.buildProjectSuccess"),
				type: "success",
			});
			LoggerService.info(namespaces.projectUI, t("topbar.buildProjectSuccessExtended", { buildId }));
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
			const { data: deploymentId, error } = await ProjectsService.run(projectId!, resources);
			if (error) {
				addToast({
					message: t("projectDeployFailed", { ns: "errors" }),
					type: "error",
				});

				return;
			}
			await fetchDeployments(projectId!, true);

			const { activeTour } = useTourStore.getState();

			fetchManualRunConfiguration(projectId, activeTour?.tourId);

			addToast({
				message: t("topbar.deployedProjectSuccess"),
				type: "success",
			});
			LoggerService.info(namespaces.projectUI, t("topbar.deployedProjectSuccessExtended", { deploymentId }));
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
		<div className="flex items-center gap-3">
			<div title={isValid ? t("topbar.buttons.build") : projectErrors}>
				<Button
					ariaLabel={t("topbar.buttons.ariaBuildProject")}
					className="group h-8 whitespace-nowrap px-3.5 text-white"
					disabled={isDeployAndBuildDisabled}
					onClick={debouncedBuild}
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

					{t("topbar.buttons.build")}
				</Button>
			</div>

			<div title={isValid ? t("topbar.buttons.deploy") : projectErrors}>
				<Button
					ariaLabel={t("topbar.buttons.ariaDeployProject")}
					className="group h-8 whitespace-nowrap px-3.5 text-white"
					disabled={isDeployAndBuildDisabled}
					id={tourStepsHTMLIds.deployButton}
					onClick={debouncedDeploy}
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

					{t("topbar.buttons.deploy")}
				</Button>
			</div>

			<ManualRunButtons />

			<DropdownButton
				contentMenu={
					<>
						<Button
							ariaLabel={t("topbar.buttons.ariaEvents")}
							className="group mb-2 h-8 w-full px-4 text-white"
							onClick={() => navigate(`/projects/${projectId}/events`)}
							title={t("topbar.buttons.ariaEvents")}
							variant="outline"
						>
							<IconSvg
								className="stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
								size="md"
								src={EventsFlag}
							/>

							<div className="mt-0.5">{t("topbar.buttons.events")}</div>
						</Button>
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
							className="group mt-2 h-8 w-full px-4 text-white"
							onClick={() => openModal(ModalName.duplicateProject)}
							variant="outline"
						>
							<IconSvg className="fill-white group-hover:fill-green-200" size="md" src={CloneIcon} />
							<div className="mt-0.5">{t("topbar.buttons.duplicate")}</div>
						</Button>
						<Button
							ariaLabel={t("topbar.buttons.deleteProject")}
							className="group mt-2 h-8 w-full px-4 text-white"
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
					</>
				}
			>
				<Button
					ariaLabel={t("topbar.buttons.projectActionsMenu")}
					className="group h-8 whitespace-nowrap px-4 text-white"
					title={t("topbar.buttons.projectActionsMenu")}
					variant="outline"
				>
					<IconSvg
						className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
						size="md"
						src={MoreIcon}
					/>

					{t("more", { ns: "buttons" })}
				</Button>
			</DropdownButton>

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
