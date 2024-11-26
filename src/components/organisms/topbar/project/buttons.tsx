import React, { useCallback, useEffect, useMemo, useState } from "react";

import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName, TopbarButton } from "@enums/components";
import { LoggerService, ProjectsService } from "@services";
import { namespaces } from "@src/constants";
import {
	useCacheStore,
	useConnectionCheckerStore,
	useManualRunStore,
	useModalStore,
	useProjectStore,
	useToastStore,
} from "@src/store";

import { Button, IconSvg, Loader, Spinner } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { DeleteProjectModal } from "@components/organisms";
import { ManualRunButtons } from "@components/organisms/topbar/project";

import { BuildIcon, MoreIcon } from "@assets/image";
import { DownloadIcon, RocketIcon, TrashIcon } from "@assets/image/icons";

export const ProjectTopbarButtons = () => {
	const { t } = useTranslation(["projects", "buttons", "errors"]);
	const { t: tError } = useTranslation("errors");
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { closeModal, openModal } = useModalStore();
	const { fetchDeployments, fetchResources, isValid, projectValidationState } = useCacheStore();
	const { fetchManualRunConfiguration } = useManualRunStore();
	const projectValidationErrors = Object.values(projectValidationState).filter((error) => error.message !== "");
	const projectErrors = isValid ? "" : Object.values(projectValidationErrors).join(", ");
	const { resetChecker } = useConnectionCheckerStore();
	const [isDeleting, setIsDeleting] = useState(false);
	const { projectsList } = useProjectStore();
	const [isExporting, setIsExporting] = useState(false);

	const { deleteProject, getProject } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const [loadingButton, setLoadingButton] = useState<Record<string, boolean>>({});

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
			await fetchManualRunConfiguration(projectId!);
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

	const handleDeleteProject = async () => {
		if (!projectId) {
			return;
		}

		setIsDeleting(true);
		const { error } = await deleteProject(projectId);
		setIsDeleting(false);

		closeModal(ModalName.deleteProject);
		if (error) {
			addToast({
				message: tError("projectRemoveFailed"),
				type: "error",
			});

			return;
		}

		resetChecker();

		addToast({
			message: t("topbar.deleteProjectSuccess"),
			type: "success",
		});
		const projectName = projectsList.find(({ id }) => id === projectId)?.name;
		LoggerService.info(namespaces.projectUI, t("topbar.deleteProjectSuccessExtended", { projectId, projectName }));

		navigate("/");
	};

	const openModalDeleteProject = useCallback(() => {
		openModal(ModalName.deleteProject);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const exportProject = useCallback(async () => {
		setIsExporting(true);
		const { data: akProjectArchiveZip, error } = await ProjectsService.export(projectId!);
		setIsExporting(false);

		if (error) {
			addToast({
				message: t("topbar.exportProjectFailed"),
				type: "error",
			});

			return;
		}

		const blob = new Blob([akProjectArchiveZip!], { type: "application/zip" });
		const url = URL.createObjectURL(blob);

		const { data: project } = await getProject(projectId!);

		const now = new Date();
		const dateTime = now
			.toLocaleString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			})
			.replace(/[/:]/g, "")
			.replace(", ", "-");

		const fileName = `ak-${project?.name}-${dateTime}-archive.zip`;
		const link = Object.assign(document.createElement("a"), {
			href: url,
			download: fileName,
		});

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

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
							ariaLabel={t("topbar.buttons.export")}
							className="group h-8 px-4 text-white"
							onClick={exportProject}
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
										className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
										size="md"
										src={DownloadIcon}
									/>
									<div className="mt-0.5">{t("topbar.buttons.export")}</div>
								</>
							)}
						</Button>
						<Button
							ariaLabel={t("topbar.buttons.delete")}
							className="group mt-2 h-8 px-4 text-white"
							onClick={openModalDeleteProject}
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
				<Button className="group h-8 whitespace-nowrap px-4 text-white" variant="outline">
					<IconSvg
						className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
						size="md"
						src={MoreIcon}
					/>

					{t("more", { ns: "buttons" })}
				</Button>
			</DropdownButton>

			<DeleteProjectModal isDeleting={isDeleting} onDelete={handleDeleteProject} />
		</div>
	);
};
