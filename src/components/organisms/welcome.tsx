import React, { useEffect, useState, useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { meowWorldProjectName } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useTemplateCreation } from "@src/hooks/useTemplateCreation";
import { TemplateMetadata } from "@src/interfaces/store";
import { useModalStore, useTemplatesStore } from "@src/store";

import { Button, IconSvg, Loader, Typography } from "@components/atoms";
import { WelcomeVideoModal } from "@components/organisms/dashboard";
import { ProjectTemplateCreateModalContainer } from "@components/organisms/dashboard/templates/tabs";

import { AKRoundLogo, ProjectsIcon } from "@assets/image";
import { StartTemplateIcon } from "@assets/image/icons";

export const WelcomePage = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const navigate = useNavigate();
	const { openModal } = useModalStore();

	const { isCreating } = useTemplateCreation();
	const { sortedCategories } = useTemplatesStore();

	const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata | undefined>(undefined);

	useEffect(() => {
		if (!sortedCategories) return;

		for (const category of sortedCategories) {
			const template = category.templates.find((template) => template.assetDirectory === meowWorldProjectName);
			if (template) {
				setSelectedTemplate(template);
				return;
			}
		}
	}, [sortedCategories]);

	const handleBrowseTemplates = () => {
		navigate("/templates-library");
	};

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};

	const handleCreateDemo = useCallback(() => {
		if (!selectedTemplate) return;

		openModal(ModalName.templateCreateProject, { template: selectedTemplate });
		return;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTemplate]);

	return (
		<div className="size-full overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
			<div className="flex min-h-screen flex-col overflow-y-auto bg-gradient-to-b from-gray-1250 to-gray-1100">
				<header className="flex items-center justify-between border-b border-gray-900 p-6">
					<div className="flex items-center">
						<IconSvg className="size-10 fill-white" src={AKRoundLogo} />
						<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
							{t("welcome.title", "Welcome to AutoKitteh")}
						</Typography>
					</div>
					<Button
						className="text-sm text-green-800"
						onClick={() => handleOpenModal("https://www.youtube.com/embed/BkUvIJc_kms")}
						variant="light"
					>
						Learn More
					</Button>
				</header>
				<main className="flex grow flex-col items-center justify-evenly px-6 py-8 md:px-16">
					<div className="mb-[10%] mt-4 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
						<div className="group flex h-full flex-col items-center rounded-2xl border-2 border-gray-900 bg-gray-1000/20 p-8 transition-colors hover:border-green-800/50">
							<div className="mb-6 rounded-full bg-gray-900 fill-white p-6 group-hover:bg-green-800/80 group-hover:fill-black">
								<IconSvg className="size-12 " src={ProjectsIcon} />
							</div>
							<Typography className="mb-4 text-2xl font-bold text-white" element="h3">
								{t("welcome.newProject", "Start from scratch")}
							</Typography>
							<Typography className="mb-8 min-h-[4.5rem] text-center text-gray-300" element="p">
								{t(
									"welcome.newProjectDesc",
									"Begin with a beginner project and build your automation exactly how you want it. Perfect for specific custom needs."
								)}
							</Typography>
							<Button
								className="mt-auto w-full justify-center rounded-lg bg-gray-900 py-3 font-semibold text-white hover:bg-green-800/80 hover:text-gray-1100"
								disabled={isCreating}
								onClick={handleCreateDemo}
							>
								{isCreating ? (
									<div className="flex items-center justify-center">
										<Loader className="mr-2" size="sm" /> Creating...
									</div>
								) : (
									t("welcome.createNew", "Start with a Demo")
								)}
							</Button>
						</div>

						<div className="group flex h-full flex-col items-center rounded-2xl border-2 border-gray-900 bg-gray-1000/20 p-8 transition-colors hover:border-green-800/50">
							<div className="mb-6 rounded-full bg-gray-900 fill-white p-6 group-hover:bg-green-800/80 group-hover:fill-black">
								<IconSvg className="size-12" src={StartTemplateIcon} />
							</div>
							<Typography className="mb-4 text-2xl font-bold text-white" element="h3">
								{t("welcome.useTemplate", "Start from template")}
							</Typography>
							<Typography className="mb-8 min-h-[4.5rem] text-center text-gray-300" element="p">
								{t(
									"welcome.useTemplateDesc",
									"Choose from our collection of ready-made templates for common workflows and integrations. The fastest way to get started."
								)}
							</Typography>
							<Button
								className="mt-auto w-full justify-center rounded-lg bg-gray-900 py-3 font-semibold text-white hover:bg-green-800/80 hover:text-gray-1100"
								onClick={handleBrowseTemplates}
							>
								{t("welcome.browseTemplates", "Browse Templates")}
							</Button>
						</div>
					</div>
				</main>
				<WelcomeVideoModal />
				{selectedTemplate ? <ProjectTemplateCreateModalContainer template={selectedTemplate} /> : null}
			</div>
		</div>
	);
};
