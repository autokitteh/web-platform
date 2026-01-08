import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ImportProjectModal, NewProjectModal } from "./modals";
import { welcomeCards } from "@src/constants";
import { ModalName, TourId } from "@src/enums";
import { useCreateProjectFromTemplate, useProjectActions } from "@src/hooks";
import { useModalStore, useTemplatesStore, useToastStore, useTourStore } from "@src/store";

import { Button, Typography } from "@components/atoms";
import { WelcomeCard } from "@components/molecules";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { WelcomeVideoModal } from "@components/organisms/dashboard";

export const WelcomePage = () => {
	const { t: tWelcome } = useTranslation("dashboard", { keyPrefix: "welcomeLanding" });
	const { t: tTours } = useTranslation("dashboard", { keyPrefix: "tours" });
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const { openModal } = useModalStore();
	const { isLoading } = useTemplatesStore();
	const { isCreating } = useCreateProjectFromTemplate();
	const { triggerFileInput } = useProjectActions();
	const [isTemplateButtonHovered, setIsTemplateButtonHovered] = useState(false);
	const { startTour } = useTourStore();

	const handleBrowseTemplates = () => {
		navigate("/templates-library");
	};

	const handleDemoProjectCreation = async () => {
		const { data: newProjectData, error: newProjectError } = await startTour(TourId.quickstart);
		if (!newProjectData?.projectId || newProjectError) {
			addToast({
				message: tTours("projectCreationFailed"),
				type: "error",
			});
			return;
		}
		const { projectId, defaultFile } = newProjectData;

		navigate(`/projects/${projectId}`, {
			state: {
				fileToOpen: defaultFile,
				startTour: TourId.quickstart,
			},
		});
	};

	const handleAction = (id: string) => {
		switch (id) {
			case "demo":
				handleDemoProjectCreation();
				return;
			case "template":
				handleBrowseTemplates();
				return;
			case "createFromScratch":
				openModal(ModalName.newProject);
				return;
			case "importExisting":
				triggerFileInput();
				return;
		}
	};

	const handleMouseHover = (optionId: string, action: "enter" | "leave") => {
		if (optionId === "template") {
			setIsTemplateButtonHovered(action === "enter");
		}
	};

	return (
		<div className="size-full overflow-hidden rounded-none md:mt-2 md:rounded-2xl">
			<LoadingOverlay isLoading={isLoading} />

			<div className="flex min-h-screen flex-col overflow-y-auto bg-gradient-to-b from-gray-1250 to-gray-1100">
				<header className="flex items-center justify-between border-b border-gray-900 p-6">
					<div className="flex items-center">
						<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
							{tWelcome("title")}
						</Typography>
					</div>
					<Button className="text-sm text-green-800 hover:underline" onClick={() => navigate("intro")}>
						{tWelcome("learnMore")}
					</Button>
				</header>
				<main className="flex grow flex-col items-center justify-evenly px-6 py-8 md:px-16">
					<div className="mb-[10%] mt-4 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
						{welcomeCards.map(({ icon, id, translationKey }) => (
							<WelcomeCard
								buttonText={tWelcome(translationKey.buttonText)}
								description={tWelcome(translationKey.description)}
								icon={icon}
								id={id}
								isHovered={isTemplateButtonHovered}
								isLoading={isCreating}
								key={id}
								onClick={() => handleAction(id)}
								onMouseEnter={() => handleMouseHover(id, "enter")}
								onMouseLeave={() => handleMouseHover(id, "leave")}
								title={tWelcome(translationKey.title)}
								type={id as "demo" | "template"}
							/>
						))}
					</div>
				</main>
				<WelcomeVideoModal />
				<NewProjectModal />
				<ImportProjectModal />
			</div>
		</div>
	);
};
