import React, { useCallback, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { DrawerName, ModalName, TopbarButton } from "@enums/components";
import { ProjectsService } from "@services";

import { useFileOperations } from "@hooks";
import { useDrawerStore, useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, IconSvg, Spinner } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { DeleteProjectModal } from "@components/organisms";
import { SettingsManualRunDrawer } from "@components/organisms/topbar/project";

import { BuildIcon, MoreIcon, RunIcon, StatsIcon } from "@assets/image";
import { GearIcon, RocketIcon, TrashIcon } from "@assets/image/icons";

export const ProjectTopbarButtons = () => {
	const { t } = useTranslation(["projects", "buttons"]);
	const { t: tError } = useTranslation("errors");
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { closeModal, openModal } = useModalStore();
	const { openDrawer } = useDrawerStore();
	const { deleteProject } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const [loadingButton, setLoadingButton] = useState<Record<string, boolean>>({});
	const { fetchResources } = useFileOperations(projectId!);

	const fetchAndCheckResources = useCallback(async () => {
		const resources = await fetchResources();
		if (!Object.keys(resources).length) {
			return;
		}

		return resources;
	}, [fetchResources]);

	const build = async () => {
		const resources = await fetchAndCheckResources();
		if (!resources) return;

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: true }));

		const { error } = await ProjectsService.build(projectId!, resources);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		} else {
			addToast({
				id: Date.now().toString(),
				message: t("topbar.buildProjectSuccess"),
				type: "success",
			});
		}

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.build]: false }));
	};

	const deploy = async () => {
		const resources = await fetchAndCheckResources();
		if (!resources) return;

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: true }));

		const { error } = await ProjectsService.run(projectId!, resources);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		} else {
			addToast({
				id: Date.now().toString(),
				message: t("topbar.deployedProjectSuccess"),
				type: "success",
			});
		}

		setLoadingButton((prev) => ({ ...prev, [TopbarButton.deploy]: false }));
	};

	const handleDeleteProject = async () => {
		if (!projectId) {
			return;
		}

		const { error } = await deleteProject(projectId);
		closeModal(ModalName.deleteProject);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tError("projectRemoveFailed"),
				type: "error",
			});

			return;
		}
		addToast({
			id: Date.now().toString(),
			message: t("topbar.deleteProjectSuccess"),
			type: "success",
		});
		navigate("/");
	};

	const handleOpenModalDeleteProject = useCallback(() => {
		openModal(ModalName.deleteProject);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const handleOpenDrawerRunSettingProject = useCallback(() => {
		openDrawer(DrawerName.projectRunSettings);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex items-stretch gap-3">
			<Button
				ariaLabel={t("topbar.buttons.ariaSettingsRun")}
				className="h-8 whitespace-nowrap"
				onClick={handleOpenDrawerRunSettingProject}
				title={t("topbar.buttons.ariaSettingsRun")}
				variant="filledGray"
			>
				<IconSvg className="fill-white" size="md" src={GearIcon} />
			</Button>

			<Button
				ariaLabel={t("topbar.buttons.manualRun")}
				className="h-8 whitespace-nowrap px-3.5"
				variant="filledGray"
			>
				<IconSvg size="md" src={RunIcon} />

				{t("topbar.buttons.manualRun")}
			</Button>

			<Button
				ariaLabel={t("topbar.buttons.ariaBuildProject")}
				className="h-8 whitespace-nowrap px-3.5"
				disabled={loadingButton[TopbarButton.build]}
				onClick={build}
				variant="filledGray"
			>
				{loadingButton[TopbarButton.build] ? <Spinner /> : <IconSvg size="md" src={BuildIcon} />}

				{t("topbar.buttons.build")}
			</Button>

			<Button
				ariaLabel={t("topbar.buttons.ariaDeployProject")}
				className="h-8 whitespace-nowrap px-3.5"
				disabled={loadingButton[TopbarButton.deploy]}
				onClick={deploy}
				variant="filledGray"
			>
				{loadingButton[TopbarButton.deploy] ? (
					<Spinner />
				) : (
					<IconSvg className="fill-white" size="md" src={RocketIcon} />
				)}

				{t("topbar.buttons.deploy")}
			</Button>

			<Button
				ariaLabel={t("topbar.buttons.ariaDeployments")}
				className="h-8 whitespace-nowrap px-4"
				href={`/projects/${projectId}/deployments`}
				variant="filledGray"
			>
				<IconSvg size="md" src={StatsIcon} />

				{t("topbar.buttons.deployments")}
			</Button>

			<DropdownButton
				contentMenu={
					<Button className="h-8 px-4" onClick={handleOpenModalDeleteProject} variant="filledGray">
						<IconSvg className="fill-white" size="md" src={TrashIcon} />

						{t("topbar.buttons.delete")}
					</Button>
				}
			>
				<Button className="h-8 whitespace-nowrap px-4" variant="filledGray">
					<IconSvg size="md" src={MoreIcon} />

					{t("more", { ns: "buttons" })}
				</Button>
			</DropdownButton>

			<DeleteProjectModal onDelete={handleDeleteProject} />

			<SettingsManualRunDrawer />
		</div>
	);
};
