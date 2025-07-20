/* eslint-disable tailwindcss/no-custom-classname */
import React, { useState } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { CONFIG, iframeCommService } from "@services/iframeComm.service";
import { welcomeCards } from "@src/constants";
import { TourId } from "@src/enums";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useTemplatesStore, useToastStore, useTourStore } from "@src/store";

import { Button, Typography } from "@components/atoms";
import { WelcomeCard } from "@components/molecules";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { ChatbotIframe } from "@components/organisms/chatbotIframe/chatbotIframe";
import { WelcomeVideoModal } from "@components/organisms/dashboard";

interface DemoFormData {
	message: string;
}

export const WelcomePage = () => {
	const [hasClearedTextarea, setHasClearedTextarea] = useState(false);
	const { t: tWelcome } = useTranslation("dashboard", { keyPrefix: "welcomeLanding" });
	const { t: tTours } = useTranslation("dashboard", { keyPrefix: "tours" });
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const { isLoading } = useTemplatesStore();
	const { isCreating } = useCreateProjectFromTemplate();
	const [isTemplateButtonHovered, setIsTemplateButtonHovered] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_isIframeLoaded, setIsIframeLoaded] = useState(false);
	const [pendingMessage, setPendingMessage] = useState<string | null>(null);
	const { startTour } = useTourStore();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<DemoFormData>({
		defaultValues: {
			message: "When webhook is received, send a Slack message to #alerts channel",
		},
	});

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
		handleBrowseTemplates();
	};

	const handleMouseHover = (optionId: string, action: "enter" | "leave") => {
		if (optionId === "template") {
			setIsTemplateButtonHovered(action === "enter");
		}
	};

	const onSubmit = (data: DemoFormData) => {
		setIsModalOpen(true);
		setPendingMessage(data.message);
	};

	const handleIframeConnect = () => {
		setIsIframeLoaded(true);
		if (pendingMessage) {
			const messageToSend = pendingMessage;
			setPendingMessage(null);
			// eslint-disable-next-line no-console
			console.log("Sending welcome message to chatbot:", messageToSend);
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
		setPendingMessage(null);
	};

	return (
		<div
			className="hero scrollbar flex min-h-screen w-full flex-col overflow-auto rounded-none bg-gradient-to-b from-gray-1250 to-gray-1100 md:mt-2 md:rounded-2xl"
			style={{
				scrollbarColor: "#166534 #23272a", // green-800 thumb, gray-1100 track
			}}
		>
			<LoadingOverlay isLoading={isLoading} />
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
			<main className="flex grow flex-col items-center justify-evenly overflow-auto">
				<section className="flex w-full justify-center">
					<div className="w-full max-w-6xl flex-col gap-8 px-6 pb-6 pt-2 md:px-16">
						<h1 className="fade-in mb-4" id="production-grade-vibe-automation">
							<span className="highlight">Production-Grade Vibe Automation</span>
							<br />
							for Dev & Ops Teams
						</h1>
						<div className="demo-section fade-in mt-16">
							<h2 className="demo-main-title">Build workflows in plain English</h2>
							<form className="demo-input-container" onSubmit={handleSubmit(onSubmit)}>
								<textarea
									{...register("message", { required: "Please enter a message" })}
									className="demo-input-modern"
									onFocus={(e) => {
										if (
											!hasClearedTextarea &&
											e.target.value ===
												"When webhook is received, send a Slack message to #alerts channel"
										) {
											e.target.value = "";
											setHasClearedTextarea(true);
										}
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											const form = e.currentTarget.form;
											if (form) {
												form.requestSubmit();
											}
										} else if (e.key === "Enter" && e.shiftKey) {
											// Allow line break
											return;
										}
									}}
									placeholder="Build workflows in plain English..."
								/>
								<button className="demo-send-btn" type="submit">
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
								</button>
							</form>
							{errors.message ? <p className="mt-2 text-red-500">{errors.message.message}</p> : null}
							<div className="demo-suggestions">
								<button className="suggestion-chip">Webhook</button>
								<button className="suggestion-chip">Email AI</button>
								<button className="suggestion-chip">AI Agent</button>
								<button className="suggestion-chip">Reddit Summary</button>
							</div>
						</div>
					</div>
				</section>
				<div className="mb-[5%] grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-0 md:grid-cols-2 md:px-16">
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
							title="AutoKitteh AI Assistant"
						/>
					</div>
				</div>
			) : null}
		</div>
	);
};
