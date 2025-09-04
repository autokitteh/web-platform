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

export const AiPage = () => {
	const [hasClearedTextarea, setHasClearedTextarea] = useState(false);
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
		formState: { errors },
	} = useForm<{ message: string }>({
		defaultValues: {
			message: "When webhook is received, send a Slack message to #alerts channel",
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

	return (
		<div
			className="scrollbar relative flex min-h-screen flex-col overflow-auto rounded-b-lg text-center md:mt-2 md:rounded-2xl"
			style={{
				scrollbarColor: "#166534 #23272a",
				background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
			}}
		>
			<div className="pointer-events-none absolute inset-0">
				<div
					className="absolute inset-0"
					style={{
						background: `radial-gradient(circle at 20% 80%, rgba(126, 211, 33, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(126, 211, 33, 0.05) 0%, transparent 50%)`,
					}}
				/>
			</div>

			<LoadingOverlay isLoading={isLoading} />
			<header className="relative z-10 flex items-center justify-between border-b border-gray-900 p-6 pb-3">
				<div className="flex items-center">
					<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
						{tAi("title")}
					</Typography>
				</div>
				<Button className="text-sm text-green-800 hover:underline" onClick={() => navigate("/intro")}>
					{tAi("learnMore")}
				</Button>
			</header>
			<main className={contentClass}>
				<section className="flex size-full min-h-0 justify-center">
					<div className="flex size-full max-w-6xl flex-col justify-between px-6 md:px-16">
						<div className="grow" />
						<div className="shrink-0 text-center">
							<h1
								className="animate-[fadeInUp_0.8s_ease_forwards]"
								id="production-grade-vibe-automation"
								style={{
									fontSize: "2.2rem",
									fontWeight: 900,
									color: "#ffffff",
									lineHeight: 1.3,
								}}
							>
								<span
									style={{
										background: "linear-gradient(135deg, #7ed321, #9aff3d)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										backgroundClip: "text",
									}}
								>
									Production-Grade Vibe Automation
								</span>
								<br />
								for Technical Builders
							</h1>
						</div>

						<div className="grow" />

						<div
							className="mx-auto w-full animate-[fadeInUp_0.8s_ease_forwards] rounded-3xl p-6 text-center md:p-10"
							style={{
								background: "rgba(26, 26, 26, 0.8)",
								border: "2px solid rgba(126, 211, 33, 0.3)",
								backdropFilter: "blur(10px)",
								boxShadow: "0 20px 60px rgba(126, 211, 33, 0.1)",
								maxWidth: "900px",
							}}
						>
							<h2
								className="mb-4 md:mb-8"
								style={{
									fontSize: "2rem",
									fontWeight: 700,
									color: "#ffffff",
									lineHeight: 1.2,
								}}
							>
								Build workflows in plain English
							</h2>
							<form onSubmit={handleSubmit(onSubmit)}>
								<AiTextArea
									{...register("message", { required: "Please enter a message" })}
									hasClearedTextarea={hasClearedTextarea}
									onClearTextarea={setHasClearedTextarea}
									submitIcon={
										<svg
											fill="none"
											height="20"
											stroke="currentColor"
											strokeWidth="2"
											viewBox="0 0 24 24"
											width="20"
										>
											<path d="M22 2L11 13" />
											<path d="M22 2L15 22L11 13L2 9L22 2Z" />
										</svg>
									}
								/>
							</form>
							{errors.message ? <p className="mt-2 text-red-500">{errors.message.message}</p> : null}

							<div className="mx-auto space-y-2" style={{ maxWidth: "1000px" }}>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
									{[
										{
											title: "Webhook to SMS (Twilio)",
											text: "Create a Twilio-based system that sends SMS notifications when triggered by a webhook. Include the webhook data in the SMS message.",
										},
										{
											title: "Website Uptime Monitor",
											text: "Monitor www.example.com every 10 minutes. Log all downtimes to Google Sheets. Send immediate Slack alerts on downtime and recovery. Send 12-hour summary reports with uptime stats in Slack.",
										},
										{
											title: "Reddit Post Tracker",
											text: 'Monitor daily Reddit posts about "Automation". Summarize the post with chatGPT and send the results to a Slack channel. You decide on the topics on Reddit. Make sure you don\'t send me the same post twice. Also, store the posts and the links in google sheets',
										},
										{
											title: "HackerNews Feed Monitor",
											text: 'Monitor daily hackernews posts about "Automation". Summarize the post and comments with chatGPT and send the results to a Slack channel. Make sure you don\'t send me the same post twice. Also, store the posts and the links in Google Sheet',
										},
										{
											title: "Send contacts from HubSpot",
											text: "Triggered by a webhook, retrieve contacts added this week in HubSpot and send their information to a Slack channel",
										},
										{
											title: "Email reply with AI",
											text: 'When a new Gmail is received, if it\'s from "XXXX", ask ChatGPT whether it\'s related to support. If it\'s a support issue, reply with "Thank you for your email. We will get back to you within 2 hours" and send a Slack message to the support channel.',
										},
										{
											title: "Notify PR in Slack",
											text: "On new PR in GitHub, send Slack message",
										},
										{
											title: "Slack Chat Bot",
											text: "Create a chat bot using chatGPT that the receives messages from a slack channel, the bot uses llm to answer user questions. The user can ask the bot to send email to someone, The bot shall use a Tool for sending an email (using Gmail). The user can ask to send slack message to a channel. There should be a tool for sending slack messages. Before sending an email verify you got from the user the recipient, subject and the body of the email. For Slack the user shall provide slack channel and message. Implement this as a long running agent where the chatGPT decides on what to do and when to use the tools.",
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
								<div
									className={`mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 ${gridColsClass} md:gap-8`}
								>
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
							aria-label="Close Modal"
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
							title="AutoKitteh AI Assistant"
						/>
					</div>
				</div>
			) : null}
			<NewProjectModal />
		</div>
	);
};
