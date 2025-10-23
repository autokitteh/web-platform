import React, { useState } from "react";

import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AutomationSuggestions2 } from "./automationSuggestions2";
import { ModalName } from "@enums/components";
import { CONFIG, iframeCommService } from "@services/iframeComm.service";
import { welcomeCards } from "@src/constants";
import { TourId } from "@src/enums";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useProjectStore, useTemplatesStore, useToastStore, useTourStore, useModalStore } from "@src/store";
import { cn } from "@src/utilities";

import { AiTextArea, Button, Typography } from "@components/atoms";
import { WelcomeCard } from "@components/molecules";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { ChatbotIframe } from "@components/organisms/chatbotIframe/chatbotIframe";
import { WelcomeVideoModal } from "@components/organisms/dashboard";
import { NewProjectModal } from "@components/organisms/modals/newProjectModal";

export const AIAgentBuilder = () => {
	const { t: tAi } = useTranslation("dashboard", { keyPrefix: "ai" });
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const { projectsList } = useProjectStore();
	const { isLoading } = useTemplatesStore();
	const { isCreating } = useCreateProjectFromTemplate();
	const { openModal } = useModalStore();
	const [isTemplateButtonHovered, setIsTemplateButtonHovered] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_isIframeLoaded, setIsIframeLoaded] = useState(false);
	const [pendingMessage, setPendingMessage] = useState<string>();
	const { startTour } = useTourStore();

	const {
		register,
		handleSubmit,
		setValue,
		clearErrors,
		formState: { errors },
		watch,
	} = useForm<{ message: string }>({
		mode: "onChange",
		defaultValues: {
			message: "",
		},
	});
	const prompt = watch("message");

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

	const onSubmit = (data: { message: string }) => {
		setIsModalOpen(true);
		setPendingMessage(data.message);
	};

	const handleIframeConnect = () => {
		setIsIframeLoaded(true);
		if (pendingMessage) {
			const messageToSend = pendingMessage;

			setPendingMessage(undefined);

			iframeCommService.sendMessage({
				type: "WELCOME_MESSAGE",
				source: CONFIG.APP_SOURCE,
				data: {
					message: messageToSend,
				},
			});
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsIframeLoaded(false);
		setPendingMessage(undefined);
	};

	const filteredWelcomeCards = welcomeCards.filter((card) => {
		if (card.id === "demo") {
			return !projectsList.some((project) => project.name.toLowerCase() === "quickstart");
		}
		return true;
	});

	const gridColsClass = filteredWelcomeCards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

	const contentClass = cn("relative z-10 flex grow flex-col items-center justify-evenly overflow-auto");

	const onSuggestionClick = (suggestion: string) => {
		flushSync(() => {
			setValue("message", suggestion);
		});

		const textareaElement = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
		if (textareaElement) {
			textareaElement.focus();
		}
		if (suggestion) {
			clearErrors("message");
		}
	};

	const buttonClass = cn("grid w-full grid-cols-1 gap-4 md:gap-8", gridColsClass);

	const suggestions = [
		"Health monitoring",
		"Release notes agent",
		"Slack notifications",
		"Pull Request Automation",
		"More...",
	];

	return (
		<div className="flex h-screen bg-gray-900">
			<div className="flex flex-1 flex-col">
				<header className="border-b border-gray-800 bg-gray-900 px-8 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<button className="rounded border border-green-400/30 px-4 py-2 text-green-400 transition-colors hover:bg-green-400/10">
								Start Tutorial
							</button>
							<button className="rounded border border-green-400/30 px-4 py-2 text-green-400 transition-colors hover:bg-green-400/10">
								Start from Template
							</button>
							<button className="rounded border border-green-400/30 px-4 py-2 text-green-400 transition-colors hover:bg-green-400/10">
								New Project
							</button>
						</div>
						<button className="text-green-400 transition-colors hover:text-green-800">Learn More</button>
					</div>
				</header>

				<main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black px-8">
					<div className="w-full max-w-4xl space-y-8">
						<div className="space-y-4 text-center">
							<h1 className="text-5xl font-bold text-white">Build AI Agents & Automations in Minutes</h1>
							<p className="text-xl text-gray-400">Prompt, configure, deploy, enhance</p>
						</div>

						<div className="relative">
							<div className="w-full rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-xl">
								<div className="flex w-full items-center gap-4">
									<form className="w-full" onSubmit={handleSubmit(onSubmit)}>
										<AiTextArea
											errors={errors}
											prompt={prompt}
											{...register("message", {
												required: tAi("aiPage.requiredMessage"),
												onChange: (e) => {
													if (errors.message && e.target.value.trim()) {
														clearErrors("message");
													}
												},
											})}
										/>
									</form>
								</div>
							</div>
						</div>

						<div className="flex flex-wrap items-center justify-center gap-3">
							<AutomationSuggestions2 onSelect={onSuggestionClick} visibleCount={8} />
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};
