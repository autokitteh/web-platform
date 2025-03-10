import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { meowWorldProjectName } from "@src/constants";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useTemplatesStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconSvg, Loader, Typography } from "@components/atoms";
import { WelcomeVideoModal } from "@components/organisms/dashboard";

import { ProjectsIcon } from "@assets/image";
import { StartTemplateIcon } from "@assets/image/icons";

export const WelcomePage = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const navigate = useNavigate();

	const { sortedCategories, fetchTemplates } = useTemplatesStore();
	const { createProjectFromAsset, isCreating } = useCreateProjectFromTemplate();
	const [isTemplateButtonHovered, setIsTemplateButtonHovered] = useState(false); // Add this line

	useEffect(() => {
		if (sortedCategories) return;
		fetchTemplates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleBrowseTemplates = () => {
		navigate("/templates-library");
	};

	const handleDemoProjectCreation = () => {
		createProjectFromAsset(meowWorldProjectName, meowWorldProjectName, "program.py");
	};

	const createDemoButtonClass = cn(
		"mt-auto w-full justify-center rounded-lg bg-green-800 py-3 text-lg font-semibold text-gray-1100",
		{
			"bg-gray-900 text-white": isTemplateButtonHovered,
		}
	);

	return (
		<div className="size-full overflow-hidden rounded-none md:mt-2 md:rounded-2xl">
			<div className="flex min-h-screen flex-col overflow-y-auto bg-gradient-to-b from-gray-1250 to-gray-1100">
				<header className="flex items-center justify-between border-b border-gray-900 p-6">
					<div className="flex items-center">
						<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
							{t("welcome.title", "Welcome to AutoKitteh")}
						</Typography>
					</div>
					<Button className="text-sm text-green-800 hover:underline" onClick={() => navigate("intro")}>
						Learn More
					</Button>
				</header>
				<main className="flex grow flex-col items-center justify-evenly px-6 py-8 md:px-16">
					<div className="mb-[10%] mt-4 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
						<Button
							className="group flex h-full flex-col items-center rounded-2xl border-2 border-green-800/50 bg-gray-800/20 p-8 pb-6 transition-colors hover:border-green-800/50"
							disabled={isCreating}
							onClick={handleDemoProjectCreation}
						>
							<div className="mb-6 rounded-full bg-gray-900 fill-white p-6 group-hover:fill-green-800/60 ">
								<IconSvg className="size-12" src={ProjectsIcon} />
							</div>
							<Typography className="mb-4 text-2xl font-bold text-white" element="h3">
								{t("welcome.newProject", "Launch Your First Automation")}
							</Typography>
							<Typography className="mb-8 min-h-[4.5rem] text-center text-gray-300" element="p">
								{t(
									"welcome.newProjectDesc",
									"A hands-on demo - deploy a simple Python script, execute, and see the output"
								)}
							</Typography>
							<div className={createDemoButtonClass}>
								{isCreating ? (
									<div className="flex items-center justify-center">
										<Loader className="mr-2" size="sm" /> Creating...
									</div>
								) : (
									t("welcome.createNew", "Start with a Demo")
								)}
							</div>
						</Button>

						<Button
							className="group flex h-full flex-col items-center rounded-2xl border-2 border-green-800/50 bg-gray-800/20 p-8 pb-6 transition-colors hover:border-green-800/50"
							onClick={handleBrowseTemplates}
							onMouseEnter={() => setIsTemplateButtonHovered(true)}
							onMouseLeave={() => setIsTemplateButtonHovered(false)}
						>
							<div className="mb-6 rounded-full bg-gray-900 fill-white p-6 group-hover:fill-green-800/60">
								<IconSvg className="size-12" src={StartTemplateIcon} />
							</div>
							<Typography className="mb-4 text-2xl font-bold text-white" element="p">
								{t("welcome.useTemplate", "Start from template")}
							</Typography>
							<Typography className="mb-8 min-h-[4.5rem] text-center text-gray-300" element="h3">
								{t(
									"welcome.useTemplateDesc",
									"Choose from our collection of ready-made templates for common workflows and integrations. The fastest way to get started"
								)}
							</Typography>
							<div className="mt-auto w-full justify-center rounded-lg bg-gray-900 py-3 text-lg font-semibold text-white group-hover:bg-green-800/80 group-hover:text-gray-1100">
								{t("welcome.browseTemplates", "Browse Templates")}
							</div>
						</Button>
					</div>
				</main>
				<WelcomeVideoModal />
			</div>
		</div>
	);
};
