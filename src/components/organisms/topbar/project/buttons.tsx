import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName, TopbarButton } from "@enums/components";
import { ProjectsService } from "@services";

import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, IconSvg, Spinner } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { DeleteProjectModal } from "@components/organisms";

import { BuildIcon, DeployIcon, MoreIcon, StatsIcon } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";

export const ProjectTopbarButtons = () => {
	const { t } = useTranslation(["projects", "buttons"]);
	const { t: tError } = useTranslation("errors");
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { closeModal, openModal } = useModalStore();
	const { deleteProject, resources } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const [loadingButton, setLoadingButton] = React.useState<Record<string, boolean>>({});

	const build = async () => {
		if (!Object.keys(resources).length) {
			return <div />;
		}

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
		if (!Object.keys(resources).length) {
			return <div />;
		}

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

	const handleOpenModalDeletePrject = React.useCallback(() => {
		openModal(ModalName.deleteProject);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex items-stretch gap-3">
			<Button
				ariaLabel={t("topbar.buttons.ariaBuildProject")}
				className="whitespace-nowrap px-4 py-2.5 font-semibold text-white hover:bg-gray-700"
				disabled={loadingButton[TopbarButton.build]}
				onClick={build}
				variant="outline"
			>
				{loadingButton[TopbarButton.build] ? <Spinner /> : <IconSvg size="lg" src={BuildIcon} />}

				{t("topbar.buttons.build")}
			</Button>

			<Button
				ariaLabel={t("topbar.buttons.ariaDeployProject")}
				className="whitespace-nowrap px-4 py-2.5 font-semibold text-white hover:bg-gray-700"
				disabled={loadingButton[TopbarButton.deploy]}
				onClick={deploy}
				variant="outline"
			>
				{loadingButton[TopbarButton.deploy] ? <Spinner /> : <IconSvg size="lg" src={DeployIcon} />}

				{t("topbar.buttons.deploy")}
			</Button>

			<Button
				ariaLabel={t("topbar.buttons.ariaStats")}
				className="whitespace-nowrap px-4 py-2.5 font-semibold text-white hover:bg-gray-700"
				href={`/projects/${projectId}/deployments`}
				variant="outline"
			>
				<IconSvg size="lg" src={StatsIcon} />

				{t("topbar.buttons.stats")}
			</Button>

			<DropdownButton
				className="font-semibold text-white"
				contentMenu={
					<Button
						className="whitespace-nowrap px-4 py-2 font-semibold text-white"
						onClick={handleOpenModalDeletePrject}
						variant="outline"
					>
						<IconSvg className="fill-white" size="md" src={TrashIcon} />

						{t("topbar.buttons.delete")}
					</Button>
				}
			>
				<Button className="h-full px-4 text-white hover:bg-gray-700" variant="outline">
					<IconSvg size="lg" src={MoreIcon} />

					{t("more", { ns: "buttons" })}
				</Button>
			</DropdownButton>

			<DeleteProjectModal onDelete={handleDeleteProject} />
		</div>
	);
};
