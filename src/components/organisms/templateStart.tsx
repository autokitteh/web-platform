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
		<div className="mx-auto max-w-7xl py-12">
			<div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
				{/* Left Column - Template Info */}
				<div
					className="relative flex flex-col space-y-8 rounded-3xl border-2 border-gray-800 
						  bg-gradient-to-b from-gray-900/40 to-gray-900/20 p-10 shadow-lg"
				>
					{/* Decorative corner accent */}
					<div
						className="absolute -left-1 -top-1 size-20 rounded-tl-3xl border-l-4 border-t-4 border-green-800 
							opacity-60"
					/>

					{isLoading ? (
						<div className="flex min-h-[400px] items-center justify-center">
							<Loader />
						</div>
					) : (
						<>
							<div className="space-y-8">
								{/* Integration Icons with enhanced styling */}
								<TemplateIntegrationsIcons
									iconClassName="bg-white/90 hover:bg-white transition-colors duration-200"
									template={selectedTemplate}
									wrapperClassName="shadow-[0_0_15px_-3px_rgba(188,248,112,0.5)] hover:shadow-[0_0_20px_-3px_rgba(188,248,112,0.7)]
									  transition-shadow duration-200"
								/>

								{/* Title with enhanced visibility */}
								<div className="space-y-4">
									<Typography
										className="text-4xl font-bold leading-tight tracking-tight text-white 
								 shadow-sm backdrop-blur-sm"
										element="h1"
									>
										{selectedTemplate?.title}
									</Typography>

									{/* Description with softer appearance */}
									<Typography className="text-xl leading-relaxed text-gray-300/90" element="h2">
										{selectedTemplate?.description}
									</Typography>
								</div>
							</div>

							{/* CTA Button with enhanced styling */}
							<div className="pt-6">
								<Button
									ariaLabel={t("buttonStart")}
									className="hover:scale-102 group flex w-full items-center justify-center gap-4 rounded-full
									 
							   bg-gradient-to-r from-green-800 to-green-800/80
							   px-10 py-4
							   shadow-[0_0_20px_-5px_rgba(188,248,112,0.5)] transition-all duration-300 hover:from-green-200 hover:to-green-200/90
							   hover:shadow-[0_0_30px_-5px_rgba(188,248,112,0.7)]"
									onClick={handleCreateClick}
								>
									<span className="text-2xl font-bold text-black group-hover:text-gray-900">
										{t("buttonStart")}
									</span>
								</Button>
							</div>
						</>
					)}
				</div>

				{/* Right Column - Video Preview */}
				<div className="flex flex-col space-y-6">
					<div
						className="group relative aspect-video w-full overflow-hidden rounded-3xl 
						   border-2 border-gray-800 bg-gray-900
						   shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]"
					>
						{/* Video thumbnail with enhanced overlay */}
						<div
							className="absolute inset-0 bg-[url('image/pages/intro/startingProject.jpg')] 
							 bg-cover bg-center bg-no-repeat
							 transition-all duration-500
							 group-hover:scale-105 group-hover:brightness-50"
						/>

						{/* Play button with enhanced interaction */}
						<div className="absolute inset-0 flex items-center justify-center">
							<IconButton
								className="transition-all duration-300 hover:scale-110"
								onClick={() =>
									handleOpenModal("https://www.youtube.com/embed/60DQ9Py4LqU?si=tat7TeACzguZKDSv")
								}
							>
								<div
									className="rounded-full bg-black/75 p-6 
								 backdrop-blur-sm
								 transition-all duration-300
								 group-hover:bg-green-800/90"
								>
									<CirclePlayIcon className="size-14 fill-white opacity-90 group-hover:opacity-100" />
								</div>
							</IconButton>
						</div>
					</div>
					<div className="flex" />

					{/* Video description with enhanced styling */}
					<div
						className="rounded-2xl border-2 border-gray-800/50 bg-gray-900/30 
						   p-8 backdrop-blur-sm"
					>
						<Typography className="text-lg leading-relaxed text-gray-400">
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
