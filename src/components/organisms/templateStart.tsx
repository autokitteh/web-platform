import React, { useCallback, useMemo } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useModalStore, useTemplatesStore, useProjectStore } from "@src/store";

import { Button, IconButton, IconSvg, Spinner, Typography, Loader } from "@components/atoms";
import { TemplateIntegrationsIcons } from "@components/molecules";
import { ProjectTemplateCreateModal } from "@components/organisms/dashboard/templates/tabs";

import { ProjectsIcon } from "@assets/image";
import { CirclePlayIcon } from "@assets/image/icons";

export const TemplateStart = ({ assetDir }: { assetDir: string }) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const { isCreating, createProjectFromAsset } = useCreateProjectFromTemplate();
	const { isLoading, sortedCategories } = useTemplatesStore();
	const { projectsList } = useProjectStore();
	const { openModal } = useModalStore();

	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);

	const selectedTemplate = useMemo(() => {
		if (!sortedCategories) return undefined;

		for (const category of sortedCategories) {
			const template = category.templates.find((template) => template.assetDirectory === assetDir);
			if (template) return template;
		}
		return undefined;
	}, [sortedCategories, assetDir]);

	const handleCreateClick = useCallback(() => {
		if (!selectedTemplate) return;

		if (projectNamesSet.has(selectedTemplate.assetDirectory)) {
			openModal(ModalName.templateCreateProject);
			return;
		}
		createProjectFromAsset(selectedTemplate.assetDirectory, selectedTemplate.title);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTemplate]);

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};

	return (
		<div className="flex items-center justify-evenly gap-3 border-b border-gray-950 pb-6 font-averta text-white">
			<div className="flex min-h-14 flex-col justify-center rounded-14 border-2 border-gray-950 bg-gray-950/10 p-3 font-averta">
				{isLoading ? (
					<Loader />
				) : (
					<>
						<TemplateIntegrationsIcons className="mx-auto" template={selectedTemplate} />
						<Typography className="pt-4 text-center text-2xl font-bold" element="h2">
							{selectedTemplate?.title}
						</Typography>

						<Typography className="py-4 text-center text-xl font-bold text-green-800" element="h3">
							{selectedTemplate?.description}
						</Typography>
						<Button
							ariaLabel={t("buttonStart")}
							className="mx-auto mb-4 mt-2 w-52 justify-center gap-3 rounded-full bg-green-800 py-2 font-averta text-2xl font-bold leading-tight hover:bg-green-200"
							onClick={handleCreateClick}
						>
							<IconSvg size="lg" src={!isCreating ? ProjectsIcon : Spinner} />
							{t("buttonStart")}
						</Button>
					</>
				)}
			</div>
			<div className="flex h-full min-h-60 w-440 flex-col">
				<div className="flex w-full flex-1 items-center justify-center rounded-2xl border border-gray-750 bg-[url('image/pages/intro/startingProject.jpg')] bg-cover bg-top bg-no-repeat">
					<IconButton
						className="group size-16 overflow-hidden rounded-full bg-black/75 shadow-sm shadow-green-800 hover:bg-black hover:shadow-none focus:scale-90"
						onClick={() => handleOpenModal("https://www.youtube.com/embed/60DQ9Py4LqU?si=tat7TeACzguZKDSv")}
					>
						<CirclePlayIcon className="rounded-full fill-white transition group-hover:opacity-100" />
					</IconButton>
				</div>
			</div>

			{selectedTemplate ? (
				<ProjectTemplateCreateModal cardTemplate={selectedTemplate} category={selectedTemplate.category} />
			) : null}
		</div>
	);
};
