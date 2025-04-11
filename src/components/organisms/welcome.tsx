import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { welcomeCards } from "@src/constants";
import { TourId } from "@src/enums";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useTemplatesStore, useToastStore, useTourStore } from "@src/store";

import { Button, Typography } from "@components/atoms";
import { WelcomeCard } from "@components/molecules";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { WelcomeVideoModal } from "@components/organisms/dashboard";

export const WelcomePage = () => {
	const { t: tWelcome } = useTranslation("dashboard", { keyPrefix: "welcomeLanding" });
	const { t: tTours } = useTranslation("dashboard", { keyPrefix: "tours" });
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const { sortedCategories, fetchTemplates, isLoading } = useTemplatesStore();
	const { isCreating } = useCreateProjectFromTemplate();
	const [isTemplateButtonHovered, setIsTemplateButtonHovered] = useState(false);
	const { startTour } = useTourStore();

	useEffect(() => {
		if (sortedCategories) return;
		fetchTemplates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleBrowseTemplates = () => {
		navigate("/templates-library");
	};

	const handleDemoProjectCreation = async () => {
		const newProjectData = await startTour(TourId.quickstart);
		if (!newProjectData) {
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
			},
		});
	};

	const handleAction = (id: string) => {
		if (id === "demo") {
			handleDemoProjectCreation();
			return;
		}
		handleBrowseTemplates();
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
						{welcomeCards.map((option) => (
							<WelcomeCard
								buttonText={tWelcome(option.translationKey.buttonText)}
								description={tWelcome(option.translationKey.description)}
								icon={option.icon}
								isHovered={isTemplateButtonHovered}
								isLoading={isCreating}
								key={option.id}
								onClick={() => handleAction(option.id)}
								onMouseEnter={() => handleMouseHover(option.id, "enter")}
								onMouseLeave={() => handleMouseHover(option.id, "leave")}
								title={tWelcome(option.translationKey.title)}
								type={option.id as "demo" | "template"}
							/>
						))}
					</div>
				</main>
				<WelcomeVideoModal />
			</div>
		</div>
	);
};
