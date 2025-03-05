import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@src/enums/components";
import { useModalStore } from "@src/store";

import { Button, IconSvg, Typography } from "@components/atoms";
import { WelcomeVideoModal } from "@components/organisms/dashboard";

import { InJustA, AKRoundLogo, ProjectsIcon } from "@assets/image";
import { StartTemplateIcon } from "@assets/image/icons";

export const WelcomePage = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const navigate = useNavigate();
	const { openModal } = useModalStore();

	const handleCreateNewProject = () => {
		// Logic for creating a new blank project
		navigate("/editor/new");
	};

	const handleBrowseTemplates = () => {
		// Navigate to templates library
		navigate("/templates-library");
	};

	const handleOpenModal = (video: string) => {
		openModal(ModalName.welcomePage, { video });
	};

	return (
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
				<div className="my-6 max-w-3xl text-center">
					<Typography className="mb-4 text-3xl font-bold text-white md:text-4xl" element="h2">
						{t("welcome.headline", "Build Reliable Automation")}
					</Typography>
					<Typography className="mb-6 text-xl font-bold text-green-800 md:text-2xl" element="h3">
						<InJustA className="mr-2 inline-block" /> {t("welcome.subheadline", "in a few lines of code")}
					</Typography>
				</div>

				<div className="mb-[10%] mt-4 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
					<div className="flex flex-col items-center rounded-2xl border-2 border-gray-900 bg-gray-1000/20 p-8 transition-colors hover:border-green-800/60">
						<div className="mb-6 rounded-full bg-gray-900 p-6">
							<IconSvg className="size-12" src={ProjectsIcon} />
						</div>
						<Typography className="mb-4 text-2xl font-bold text-white" element="h3">
							{t("welcome.newProject", "Start from scratch")}
						</Typography>
						<Typography className="mb-8 text-center text-gray-300" element="p">
							{t(
								"welcome.newProjectDesc",
								"Begin with a beginner project and build your automation exactly how you want it. Perfect for specific custom needs."
							)}
						</Typography>
						<Button
							className="w-full justify-center rounded-lg bg-gray-900 py-3 text-white hover:bg-gray-800"
							onClick={handleCreateNewProject}
						>
							{t("welcome.createNew", "Start with a Demo")}
						</Button>
					</div>

					<div className="flex flex-col items-center rounded-2xl border-2 border-green-800/40 bg-gray-1000/20 p-8 transition-colors hover:border-green-800">
						<div className="mb-6 rounded-full bg-green-800/20 p-6">
							<IconSvg className="size-12" src={StartTemplateIcon} />
						</div>
						<Typography className="mb-4 text-2xl font-bold text-white" element="h3">
							{t("welcome.useTemplate", "Start from template")}
						</Typography>
						<Typography className="mb-2 text-center text-gray-300" element="p">
							{t(
								"welcome.useTemplateDesc",
								"Choose from our collection of ready-made templates for common workflows and integrations. The fastest way to get started."
							)}
						</Typography>
						<Button
							className="mt-6 w-full justify-center rounded-lg bg-green-800 py-3"
							onClick={handleBrowseTemplates}
						>
							{t("welcome.browseTemplates", "Browse Templates")}
						</Button>
					</div>
				</div>
			</main>
			<WelcomeVideoModal />
		</div>
	);
};
