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
		<div className="mx-auto max-w-7xl pt-4">
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				{/* Left Column - Template Info */}
				<div className="flex flex-col space-y-6 rounded-2xl border-2 border-gray-800 bg-gray-900/20 p-8">
					{isLoading ? (
						<div className="flex min-h-[400px] items-center justify-center">
							<Loader />
						</div>
					) : (
						<div className="flex h-full flex-col justify-between">
							<TemplateIntegrationsIcons
								iconClassName="bg-white"
								template={selectedTemplate}
								wrapperClassName="shadow-[-2px_-1px_13px_-4px_#BCF870]"
							/>
							<Typography className="text-3xl font-bold text-white" element="h2">
								{selectedTemplate?.title}
							</Typography>
							<Typography className="text-xl" element="h3">
								{selectedTemplate?.description}
							</Typography>

							<Button
								ariaLabel={t("buttonStart")}
								className="mx-auto mb-4 mt-2 w-52 justify-center gap-3 rounded-full bg-green-800 py-2 font-averta text-2xl font-bold leading-tight shadow-[0px_0px_14px_-4px_#BCF870] hover:bg-green-200"
								onClick={handleCreateClick}
							>
								<IconSvg size="lg" src={!isCreating ? ProjectsIcon : Spinner} />
								{t("buttonStart")}
							</Button>
						</div>
					)}
				</div>

				{/* Right Column - Video Preview */}
				<div className="flex flex-col space-y-4">
					<div
						className="relative aspect-video w-full overflow-hidden rounded-2xl 
							border-2 border-gray-800 bg-gray-900"
					>
						<div
							className="absolute inset-0 bg-[url('image/pages/intro/startingProject.jpg')] 
							  bg-cover bg-center bg-no-repeat brightness-75"
						/>
						<div className="absolute inset-0 flex items-center justify-center">
							<IconButton
								className="group transition-all duration-200 hover:scale-110"
								onClick={() =>
									handleOpenModal("https://www.youtube.com/embed/60DQ9Py4LqU?si=tat7TeACzguZKDSv")
								}
							>
								<div className="rounded-full bg-black/75 p-5 group-hover:bg-black">
									<CirclePlayIcon className="size-12 fill-white opacity-90 group-hover:opacity-100" />
								</div>
							</IconButton>
						</div>
					</div>

					<div className="rounded-xl border-2 border-gray-800 bg-gray-900/20 p-6">
						<Typography className="text-lg leading-relaxed text-gray-300">
							Watch our quick tutorial video to learn how to get started with this template and make the
							most of its features.
						</Typography>
					</div>
				</div>
			</div>

			{selectedTemplate ? (
				<ProjectTemplateCreateModal cardTemplate={selectedTemplate} category={selectedTemplate.category} />
			) : null}
		</div>
	);
};
