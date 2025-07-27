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
			className="scrollbar relative flex min-h-screen flex-col overflow-auto rounded-b-lg text-center md:mt-2 md:rounded-2xl"
			style={{
				scrollbarColor: "#166534 #23272a", // green-800 thumb, gray-1100 track
				background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
			}}
		>
			{/* Hero background effects */}
			<div className="pointer-events-none absolute inset-0">
				<div
					className="absolute inset-0"
					style={{
						background: `
							radial-gradient(circle at 20% 80%, rgba(126, 211, 33, 0.1) 0%, transparent 50%),
							radial-gradient(circle at 80% 20%, rgba(126, 211, 33, 0.05) 0%, transparent 50%)
						`,
					}}
				/>
			</div>

			<LoadingOverlay isLoading={isLoading} />
			<header className="relative z-10 flex items-center justify-between border-b border-gray-900 p-6 pb-3">
				<div className="flex items-center">
					<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
						{tWelcome("title")}
					</Typography>
				</div>
				<Button className="text-sm text-green-800 hover:underline" onClick={() => navigate("intro")}>
					{tWelcome("learnMore")}
				</Button>
			</header>
			<main className="relative z-10 flex grow flex-col items-center justify-evenly overflow-auto">
				<section className="flex size-full justify-center">
					<div className="flex size-full max-w-6xl flex-col justify-around gap-8 rounded-lg px-6 pb-3 md:px-16">
						<div className="flex-1" />
						{/* Hero Title with highlight effect */}
						<h1
							className="animate-[fadeInUp_0.8s_ease_forwards]"
							id="production-grade-vibe-automation"
							style={{
								fontSize: "2.8rem",
								fontWeight: 900,
								color: "#ffffff",
								lineHeight: 1.4,
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
							for Dev & Ops Teams
						</h1>

						{/* Demo Section */}
						<div
							className="mx-auto my-6 w-full animate-[fadeInUp_0.8s_ease_forwards] rounded-3xl p-10 text-center"
							style={{
								background: "rgba(26, 26, 26, 0.8)",
								border: "2px solid rgba(126, 211, 33, 0.3)",
								backdropFilter: "blur(10px)",
								boxShadow: "0 20px 60px rgba(126, 211, 33, 0.1)",
								maxWidth: "900px",
							}}
						>
							<h2
								className="mb-8"
								style={{
									fontSize: "2rem",
									fontWeight: 700,
									color: "#ffffff",
									lineHeight: 1.2,
								}}
							>
								Build workflows in plain English
							</h2>
							<form
								className="relative mx-auto mb-6"
								onSubmit={handleSubmit(onSubmit)}
								style={{ maxWidth: "700px" }}
							>
								<textarea
									{...register("message", { required: "Please enter a message" })}
									className="font-inherit w-full resize-none overflow-hidden"
									onBlur={(e) => {
										e.target.style.borderColor = "rgba(126, 211, 33, 0.3)";
										e.target.style.boxShadow = "none";
										if (!e.target.value) {
											e.target.style.color = "#888";
										}
									}}
									onFocus={(e) => {
										e.target.style.borderColor = "#7ed321";
										e.target.style.boxShadow = "0 0 20px rgba(126, 211, 33, 0.2)";
										e.target.style.color = "#ffffff";

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
									style={{
										padding: "20px 60px 20px 20px",
										border: "2px solid rgba(126, 211, 33, 0.3)",
										borderRadius: "16px",
										fontSize: "1rem",
										minHeight: "60px",
										background: "rgba(15, 15, 15, 0.9)",
										color: "#888",
										transition: "all 0.3s ease",
									}}
								/>
								<button
									className="absolute flex cursor-pointer items-center justify-center border-none transition-all duration-300 ease-in-out"
									onMouseEnter={(e) => {
										e.currentTarget.style.background = "#6bb31a";
										e.currentTarget.style.transform = "translateY(-50%) scale(1.05)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = "#7ed321";
										e.currentTarget.style.transform = "translateY(-50%)";
									}}
									style={{
										right: "12px",
										top: "50%",
										transform: "translateY(-50%)",
										width: "36px",
										height: "36px",
										background: "#7ed321",
										borderRadius: "8px",
										color: "#000",
									}}
									type="submit"
								>
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

							{/* Suggestion chips */}
							<div className="mx-auto flex flex-wrap justify-center gap-3" style={{ maxWidth: "700px" }}>
								{["Webhook", "Email AI", "AI Agent", "Reddit Summary"].map((suggestion) => (
									<button
										className="cursor-pointer transition-all duration-300 ease-in-out"
										key={suggestion}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = "rgba(126, 211, 33, 0.1)";
											e.currentTarget.style.borderColor = "#7ed321";
											e.currentTarget.style.color = "#ffffff";
											e.currentTarget.style.transform = "translateY(-2px)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = "rgba(40, 40, 40, 0.8)";
											e.currentTarget.style.borderColor = "rgba(126, 211, 33, 0.2)";
											e.currentTarget.style.color = "#cccccc";
											e.currentTarget.style.transform = "translateY(0)";
										}}
										style={{
											background: "rgba(40, 40, 40, 0.8)",
											border: "1px solid rgba(126, 211, 33, 0.2)",
											borderRadius: "24px",
											padding: "10px 18px",
											color: "#cccccc",
											fontSize: "0.9rem",
											fontWeight: 500,
											backdropFilter: "blur(10px)",
										}}
									>
										{suggestion}
									</button>
								))}
							</div>
						</div>
						<div className="grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-0 md:grid-cols-2 md:px-16">
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
						<div className="flex-1" />
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
							title="AutoKitteh AI Assistant"
						/>
					</div>
				</div>
			) : null}
		</div>
	);
};
