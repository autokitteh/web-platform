import React, { useState } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

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

export const CreateNewProject = ({ isWelcomePage }: { isWelcomePage?: boolean }) => {
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
	} = useForm<{ message: string }>({
		mode: "onChange",
		defaultValues: {
			message: "",
		},
	});

	const handleBrowseTemplates = () => {
		navigate("/templates-library");
	};
	const location = useLocation();
	const hideButtonsFromLocation = location.state?.hideButtons;

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

	const contentClass = cn("relative z-10 flex grow flex-col items-center justify-evenly overflow-auto", {
		"justify-between pt-16": hideButtonsFromLocation,
	});

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
						<div className="shrink-0 text-center">
							<h1
								className="animate-[fadeInUp_0.8s_ease_forwards] text-[2.2rem] font-black leading-[1.3] text-white"
								id="production-grade-vibe-automation"
							>
								<span className="bg-gradient-to-br from-[#7ed321] to-[#9aff3d] bg-clip-text text-transparent">
									{tAi("mainHeading.productionGrade")}
								</span>
								<br />
								{tAi("mainHeading.forTechnicalBuilders")}
							</h1>
						</div>

						<div className="grow" />

						<div className="w-full animate-[fadeInUp_0.8s_ease_forwards] rounded-3xl border-2 border-[rgba(126,211,33,0.3)] bg-[rgba(26,26,26,0.8)] p-6 text-center shadow-[0_20px_60px_rgba(126,211,33,0.1)] backdrop-blur-[10px] md:p-10">
							<h2 className="mb-4 text-[2rem] font-bold leading-[1.2] text-white md:mb-8">
								{tAi("buildWorkflows")}
							</h2>
							<form onSubmit={handleSubmit(onSubmit)}>
								<AiTextArea
									errors={errors}
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

							<div className="space-y-2">
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
									{[
										{
											title: tAi("examples.webhookSms.title"),
											text: tAi("examples.webhookSms.text"),
										},
										{
											title: tAi("examples.uptimeMonitor.title"),
											text: tAi("examples.uptimeMonitor.text"),
										},
										{
											title: tAi("examples.redditTracker.title"),
											text: tAi("examples.redditTracker.text"),
										},
										{
											title: tAi("examples.hackerNewsMonitor.title"),
											text: tAi("examples.hackerNewsMonitor.text"),
										},
										{
											title: tAi("examples.hubspotContacts.title"),
											text: tAi("examples.hubspotContacts.text"),
										},
										{
											title: tAi("examples.emailReply.title"),
											text: tAi("examples.emailReply.text"),
										},
										{
											title: tAi("examples.slackPrNotify.title"),
											text: tAi("examples.slackPrNotify.text"),
										},
										{
											title: tAi("examples.slackChatBot.title"),
											text: tAi("examples.slackChatBot.text"),
										},
									].map((action, index) => (
										<button
											className="flex w-full cursor-pointer items-center justify-center rounded-full border border-gray-600/50 bg-gray-800/60 px-2 py-1.5 text-center text-xs text-gray-300 transition-all duration-300 ease-in-out hover:border-green-400/50 hover:bg-gray-700/80 sm:text-sm"
											key={index}
											onClick={() => {
												setValue("message", action.text);
												const textareaElement = document.querySelector(
													'textarea[name="message"]'
												) as HTMLTextAreaElement;
												if (textareaElement) {
													textareaElement.style.color = "#ffffff";
													textareaElement.focus();
												}
											}}
										>
											<span className="truncate">{action.title}</span>
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="grow" />

						{hideButtonsFromLocation ? null : (
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
						)}

						<div className="grow" />
					</div>
				</section>
			</main>
			<WelcomeVideoModal />
			{isModalOpen ? (
				<div className="fixed inset-0 z-[99] flex items-center justify-center rounded-lg bg-black/60 p-4">
					<div className="relative size-[85%] rounded-lg bg-black">
						<Button
							aria-label={tAi("modal.closeLabel")}
							className="absolute right-6 top-6 z-10 rounded-full bg-transparent p-1.5 hover:bg-gray-200"
							onClick={handleCloseModal}
						>
							<svg
								className="size-5 text-gray-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M6 18L18 6M6 6l12 12"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</Button>
						<ChatbotIframe
							className="size-full"
							hideCloseButton
							onConnect={handleIframeConnect}
							padded
							title={tAi("modal.assistantTitle")}
						/>
					</div>
				</div>
			) : null}
			<NewProjectModal />
		</div>
	);
};
