import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@enums/components";
import { welcomeCards } from "@src/constants";
import { TourId } from "@src/enums";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useProjectStore, useTemplatesStore, useToastStore, useTourStore, useModalStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, Typography } from "@components/atoms";
import { SocialProof, WelcomeCard } from "@components/molecules";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { AiWorkflowBuilderModal } from "@components/organisms/aiWorkflowBuilderModal";
import { WelcomeVideoModal } from "@components/organisms/dashboard";
import { NewProjectModal } from "@components/organisms/modals/newProjectModal";

export const CreateNewProject = ({ isWelcomePage }: { isWelcomePage?: boolean }) => {
	const { t: tAi } = useTranslation("dashboard", { keyPrefix: "ai" });
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const { projectsList } = useProjectStore();
	const { isLoading } = useTemplatesStore();
	const { isCreating } = useCreateProjectFromTemplate();
	const { openModal } = useModalStore();
	const [isTemplateButtonHovered, setIsTemplateButtonHovered] = useState(false);
	const [isAiModalOpen, setIsAiModalOpen] = useState(false);
	const { startTour } = useTourStore();

	const handleBrowseTemplates = () => {
		navigate("/templates-library");
	};

	const handleDemoProjectCreation = async () => {
		const { data: newProjectData, error: newProjectError } = await startTour(TourId.quickstart);
		if (!newProjectData?.projectId || newProjectError) {
			addToast({
				message: tAi("projectCreationFailed"),
				type: "error",
			});
			return;
		}
		const { projectId, defaultFile } = newProjectData;

		navigate(`/projects/${projectId}/code`, {
			state: {
				fileToOpen: defaultFile,
				startTour: TourId.quickstart,
			},
		});
	};

	const handleAction = (id: string) => {
		if (id === "demo") {
			handleDemoProjectCreation();
			return;
		}
		if (id === "template") {
			handleBrowseTemplates();
			return;
		}
		if (id === "createFromScratch") {
			openModal(ModalName.newProject);
			return;
		}
	};

	const handleMouseHover = (optionId: string, action: "enter" | "leave") => {
		if (optionId === "template") {
			setIsTemplateButtonHovered(action === "enter");
		}
	};

	const filteredWelcomeCards = welcomeCards.filter((card) => {
		if (card.id === "demo") {
			return !projectsList.some((project) => project.name.toLowerCase() === "quickstart");
		}
		return true;
	});

	const gridColsClass = filteredWelcomeCards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

	const contentClass = cn("relative z-10 flex grow flex-col items-center justify-evenly overflow-auto");

	const buttonClass = cn("grid w-full grid-cols-1 gap-4 md:gap-8", gridColsClass);

	return (
		<div className="scrollbar relative flex min-h-screen flex-col overflow-auto rounded-b-lg bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] text-center md:mt-2 md:rounded-2xl">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(126,211,33,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(126,211,33,0.05)_0%,transparent_50%)]" />
			</div>

			<LoadingOverlay isLoading={isLoading} />
			<header className="relative z-10 flex items-center justify-between border-b border-gray-900 p-6 pb-3">
				<div className="flex items-center">
					<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
						{isWelcomePage ? tAi("welcomeTitle") : tAi("title")}
					</Typography>
				</div>
				<Button className="text-sm text-green-800 hover:underline" onClick={() => navigate("/intro")}>
					{tAi("learnMore")}
				</Button>
			</header>
			<main className={contentClass}>
				<section className="flex size-full min-h-0 justify-center">
					<div className="flex size-full w-4/5 max-w-[1440px] flex-col justify-between px-6 md:px-16">
						<div className="grow" />

						<div className="shrink-0 space-y-8 text-center">
							<div className="space-y-4">
								<h1 className="animate-[fadeInUp_0.8s_ease_forwards] text-[2.5rem] font-black leading-[1.2] text-white md:text-[3rem]">
									{tAi("hero.headline")}
								</h1>
								<p className="mx-auto max-w-2xl text-lg text-gray-300 md:text-xl">
									{tAi("hero.subheadline")}
								</p>
							</div>

							<div className="flex justify-center">
								<Button
									className="animate-[fadeInUp_1s_ease_forwards] rounded-full bg-gradient-to-r from-[#7ed321] to-[#9aff3d] px-8 py-4 text-lg font-bold text-black shadow-[0_8px_32px_rgba(126,211,33,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_48px_rgba(126,211,33,0.5)] md:px-12 md:py-5 md:text-xl"
									onClick={() => setIsAiModalOpen(true)}
								>
									{tAi("hero.cta")} →
								</Button>
							</div>

							<div className="animate-[fadeInUp_1.2s_ease_forwards]">
								<SocialProof />
							</div>
						</div>

						<div className="grow" />

						<div className="w-full shrink-0">
							<div className={buttonClass}>
								{filteredWelcomeCards.map((option) => (
									<WelcomeCard
										buttonText={tAi(option.translationKey.buttonText)}
										description={tAi(option.translationKey.description)}
										icon={option.icon}
										isHovered={isTemplateButtonHovered}
										isLoading={isCreating}
										key={option.id}
										onClick={() => handleAction(option.id)}
										onMouseEnter={() => handleMouseHover(option.id, "enter")}
										onMouseLeave={() => handleMouseHover(option.id, "leave")}
										title={tAi(option.translationKey.title)}
										type={option.id as "demo" | "template" | "createFromScratch"}
									/>
								))}
							</div>
						</div>

						<div className="grow" />
					</div>
				</section>
			</main>
			<WelcomeVideoModal />
			<AiWorkflowBuilderModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
			<NewProjectModal />
		</div>
	);
};
