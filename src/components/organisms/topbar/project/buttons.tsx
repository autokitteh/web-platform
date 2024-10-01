import React, { useCallback, useEffect, useRef, useState } from "react";

import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName, TopbarButton } from "@enums/components";
import { LoggerService, ProjectsService } from "@services";
import { namespaces } from "@src/constants";
import { useCacheStore, useModalStore, useProjectStore, useProjectValidationStore, useToastStore } from "@src/store";

import { useFileOperations } from "@hooks";

import { Button, IconSvg, Spinner } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { DeleteProjectModal } from "@components/organisms";

import { BuildIcon, MoreIcon } from "@assets/image";
import { RocketIcon, TrashIcon } from "@assets/image/icons";

export const ProjectTopbarButtons = () => {
	const { t } = useTranslation(["projects", "buttons", "errors"]);
	const { t: tError } = useTranslation("errors");
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { closeModal, openModal } = useModalStore();
	const { isValid, projectValidationState } = useProjectValidationStore();
	const projectValidationErrors = Object.values(projectValidationState).filter((error) => error.message !== "");
	const projectErrors = isValid ? "" : Object.values(projectValidationErrors).join(", ");

	const { deleteProject } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const [loadingButton, setLoadingButton] = useState<Record<string, boolean>>({});
	const { fetchDeployments } = useCacheStore();
	const { getResources } = useFileOperations(projectId!);

	const fetchResources = useCallback(async () => {
		const resources = await getResources();
		if (!Object.keys(resources).length) {
			addToast({
				message: tError("assetsNotFound"),
				type: "error",
			});
			LoggerService.error(namespaces.projectUI, tError("assetsNotFound"));

			return;
		}

		return resources;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getResources]);

	const build = useCallback(async () => {
		const resources = await fetchResources();
		if (!resources) return;

		try {
			setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: true }));

			const { error } = await ProjectsService.build(projectId!, resources);
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
			LoggerService.info(namespaces.projectUI, t("topbar.buildProjectSuccess"));
		} finally {
			setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: false }));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const deploy = useCallback(async () => {
		const resources = await fetchResources();
		if (!resources) return;

		try {
			setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: true }));
			const { error } = await ProjectsService.run(projectId!, resources);
			if (error) {
				addToast({
					message: t("projectDeployFailed", { ns: "errors" }),
					type: "error",
				});

				return;
			}

			fetchDeployments(projectId!, true);

			addToast({
				message: t("topbar.deployedProjectSuccess"),
				type: "success",
			});
			LoggerService.info(namespaces.projectUI, t("topbar.deployedProjectSuccess"));
		} finally {
			setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: false }));
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const debouncedBuild = useRef(debounce(build, 1000, { leading: true, trailing: false })).current;
	const debouncedDeploy = useRef(debounce(deploy, 1000, { leading: true, trailing: false })).current;

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

		const { error } = await deleteProject(projectId);
		closeModal(ModalName.deleteProject);
		if (error) {
			addToast({
				message: tError("projectRemoveFailed"),
				type: "error",
			});

			return;
		}
		addToast({
			message: t("topbar.deleteProjectSuccess"),
			type: "success",
		});
		LoggerService.info(namespaces.projectUI, t("topbar.deleteProjectSuccess"));

		navigate("/");
	};

	const openModalDeleteProject = useCallback(() => {
		openModal(ModalName.deleteProject);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isDeployOrBuildDisabled = loadingButton[TopbarButton.deploy] || loadingButton[TopbarButton.build];

	return (
		<div className="flex items-center gap-3">
			<div title={isValid ? t("topbar.buttons.build") : projectErrors}>
				<Button
					ariaLabel={t("topbar.buttons.ariaBuildProject")}
					className="group h-8 whitespace-nowrap px-3.5"
					disabled={isDeployOrBuildDisabled}
					onClick={debouncedBuild}
					variant="outline"
				>
					{loadingButton[TopbarButton.build] ? (
						<Spinner />
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

			<div title={isValid ? t("topbar.buttons.build") : projectErrors}>
				<Button
					ariaLabel={t("topbar.buttons.ariaDeployProject")}
					className="group h-8 whitespace-nowrap px-3.5"
					disabled={isDeployOrBuildDisabled}
					onClick={debouncedDeploy}
					variant="outline"
				>
					{loadingButton[TopbarButton.deploy] ? (
						<Spinner />
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

			<DropdownButton
				contentMenu={
					<Button className="group h-8 px-4" onClick={openModalDeleteProject} variant="outline">
						<IconSvg
							className="-mt-0.5 stroke-white transition group-hover:stroke-green-200 group-active:stroke-green-800"
							size="md"
							src={TrashIcon}
						/>

						{t("topbar.buttons.delete")}
					</Button>
				}
			>
				<Button className="group h-8 whitespace-nowrap px-4" variant="outline">
					<IconSvg
						className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
						size="md"
						src={MoreIcon}
					/>

					{t("more", { ns: "buttons" })}
				</Button>
			</DropdownButton>

			<DeleteProjectModal onDelete={handleDeleteProject} />
		</div>
	);
};
