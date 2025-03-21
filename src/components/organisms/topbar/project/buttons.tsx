import React, { useCallback, useEffect, useMemo, useState } from "react";

import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ProjectExportModal } from "./projectExportModal";
import { ModalName, TopbarButton } from "@enums/components";
import { LoggerService, ProjectsService } from "@services";
import { namespaces } from "@src/constants";
import { DeploymentStateVariant } from "@src/enums";
import { useProjectActions } from "@src/hooks";
import { useCacheStore, useManualRunStore, useModalStore, useToastStore } from "@src/store";

import { Button, IconSvg, Loader, Spinner } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import {
	DeleteActiveDeploymentProjectModal,
	DeleteDrainingDeploymentProjectModal,
	DeleteProjectModal,
} from "@components/organisms/modals";
import { ManualRunButtons } from "@components/organisms/topbar/project";

import { BuildIcon, MoreIcon } from "@assets/image";
import { EventsFlag, ExportIcon, RocketIcon, TrashIcon } from "@assets/image/icons";

export const ProjectTopbarButtons = () => {
	const { t } = useTranslation(["projects", "buttons", "errors"]);
	const { projectId } = useParams();
	const { closeModal, openModal } = useModalStore();
	const { fetchDeployments, fetchResources, isValid, deployments, projectValidationState } = useCacheStore();
	const { fetchManualRunConfiguration } = useManualRunStore();
	const projectValidationErrors = Object.values(projectValidationState).filter((error) => error.message !== "");
	const projectErrors = isValid ? "" : Object.values(projectValidationErrors).join(", ");
	const { deleteProject, deactivateDeployment, isDeleting, isExporting } = useProjectActions();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const [loadingButton, setLoadingButton] = useState<Record<string, boolean>>({});
	const [selectedActiveDeploymentId, setSelectedActiveDeploymentId] = useState<string>();
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
			setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: true }));

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
			setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: false }));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const deploy = useCallback(async () => {
		const resources = await fetchResources(projectId!);
		if (!resources) return;

		try {
			setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: true }));
			const { data: deploymentId, error } = await ProjectsService.run(projectId!, resources);
			if (error) {
				addToast({
					message: t("projectDeployFailed", { ns: "errors" }),
					type: "error",
				});

				return;
			}
			await fetchDeployments(projectId!, true);
			fetchManualRunConfiguration(projectId!);
			addToast({
				message: t("topbar.deployedProjectSuccess"),
				type: "success",
			});
			LoggerService.info(namespaces.projectUI, t("topbar.deployedProjectSuccessExtended", { deploymentId }));
		} finally {
			setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: false }));
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

	const isDeployAndBuildDisabled = loadingButton[TopbarButton.deploy] || loadingButton[TopbarButton.build];

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
					{loadingButton[TopbarButton.build] ? (
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
					onClick={debouncedDeploy}
					variant="outline"
				>
					{loadingButton[TopbarButton.deploy] ? (
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
							className="group mb-2 h-8 px-4 text-white"
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
							className="group h-8 px-4 text-white"
							onClick={() => openModal(ModalName.projectExport)}
							variant="outline"
						>
							{isExporting ? (
								<>
									<Loader size="sm" />
									<div className="mt-0.5">{t("topbar.buttons.export")}</div>
								</>
							) : (
								<>
									<IconSvg
										className="stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
										size="md"
										src={ExportIcon}
									/>
									<div className="mt-0.5">{t("topbar.buttons.export")}</div>
								</>
							)}
						</Button>
						<Button
							ariaLabel={t("topbar.buttons.deleteProject")}
							className="group mt-2 h-8 px-4 text-white"
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
			<ProjectExportModal />
		</div>
	);
};
