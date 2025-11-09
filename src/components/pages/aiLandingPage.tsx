import React, { useState, useMemo } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { createAiLandingPagePrompts } from "@constants/aiLandingPagePrompts";
import { ModalName } from "@enums/components";
import { CONFIG, iframeCommService } from "@services/iframeComm.service";
import { TourId } from "@src/enums";
import { useProjectStore, useToastStore, useTourStore, useModalStore } from "@src/store";
import { cn } from "@src/utilities";

import { AiTextArea, Button, Typography } from "@components/atoms";
import { ChatbotIframe } from "@components/organisms/chatbotIframe/chatbotIframe";

const pillsPerPage = 4;

export const AiLandingPage = () => {
	const { t: tAi } = useTranslation("dashboard", { keyPrefix: "ai" });
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const { projectsList } = useProjectStore();
	const { openModal } = useModalStore();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [pendingMessage, setPendingMessage] = useState<string>();
	const [visiblePillsCount, setVisiblePillsCount] = useState(pillsPerPage);
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

	const allSuggestionPills = useMemo(() => createAiLandingPagePrompts(tAi), [tAi]);

	const visiblePills = allSuggestionPills.slice(0, visiblePillsCount);
	const hasMorePills = visiblePillsCount < allSuggestionPills.length;

	const handleStartTutorial = async () => {
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

	const handleStartFromTemplate = () => {
		navigate("/templates-library");
	};

	const handleNewProject = () => {
		openModal(ModalName.newProject);
	};

	const handleLearnMore = () => {
		navigate("/intro");
	};

	const onSubmit = (data: { message: string }) => {
		setIsModalOpen(true);
		setPendingMessage(data.message);
	};

	const handleIframeConnect = () => {
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
		setPendingMessage(undefined);
	};

	const onSuggestionClick = (suggestion: string) => {
		setValue("message", suggestion);
		const textareaElement = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
		if (textareaElement) {
			textareaElement.focus();
		}
		if (suggestion) {
			clearErrors("message");
		}
	};

	const handleLoadMore = () => {
		setVisiblePillsCount(allSuggestionPills.length);
	};

	const showQuickstart = !projectsList.some((project) => project.name.toLowerCase() === "quickstart");

	return (
		<div className="relative flex min-h-screen flex-col overflow-y-scroll bg-[#1B1C1A] text-white">
			<header className="relative z-10 border-b border-gray-900/50 p-4 md:px-6">
				<div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
					<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3 md:gap-4">
						{showQuickstart ? (
							<Button
								className="w-full rounded-none border border-green-400/30 bg-transparent px-4 py-2 text-base text-[#bcf870] hover:border-green-400/50 hover:bg-green-400/10 sm:w-auto md:px-6 md:text-base"
								onClick={handleStartTutorial}
							>
								<Typography className="font-medium">Start Tutorial</Typography>
							</Button>
						) : null}
						<Button
							className="w-full rounded-none border border-green-400/50 bg-transparent px-4 py-2 text-base text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10 sm:w-auto md:px-6 md:text-base"
							onClick={handleStartFromTemplate}
						>
							<Typography className="font-medium">Start from Template</Typography>
						</Button>
						<Button
							className="w-full rounded-none border border-green-400/50 bg-transparent px-4 py-2 text-base text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10 sm:w-auto md:px-6 md:text-base"
							onClick={handleNewProject}
						>
							<Typography className="font-medium">New Project</Typography>
						</Button>
					</div>
					<Button
						className="ml-2 w-full rounded-none bg-transparent text-base text-[#bcf870] hover:underline sm:w-auto"
						onClick={handleLearnMore}
					>
						{tAi("learnMore")}
					</Button>
				</div>
			</header>

			<main className="relative mt-[5%] flex flex-1 flex-col items-center p-4 md:px-6">
				<div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-8 md:gap-12">
					<div className="mt-8 text-center">
						<Typography
							className="mb-8 text-2xl font-black leading-tight sm:text-3xl md:mb-12 md:text-4xl lg:text-5xl"
							element="h1"
						>
							<span className="text-white">Build AI Agents & Automations in Minutes</span>
						</Typography>
						<Typography
							className="mb-8 text-xl font-bold text-[#fdfffa] sm:text-2xl md:text-3xl"
							element="h2"
						>
							Prompt, configure, deploy, enhance
						</Typography>
					</div>

					<div className="w-11/12 md:w-3/5">
						<form className="mb-4 md:mb-6" onSubmit={handleSubmit(onSubmit)}>
							<AiTextArea
								className="text-white placeholder:pl-2 placeholder:text-white"
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
					<div className="flex w-full flex-col items-center gap-4">
						<div className="flex w-full max-w-6xl flex-wrap items-center justify-center gap-2 md:gap-3">
							{visiblePills.map((suggestion, index) => (
								<button
									className={cn(
										"cursor-pointer rounded-full border border-gray-600/50 bg-[#1b1c1a] px-3 py-1.5",
										"w-full text-sm text-gray-600 transition-all duration-300 sm:w-[calc(50%-0.375rem)] sm:px-4 sm:py-3 sm:text-sm md:w-[calc(25%-1.5rem)] md:text-sm",
										"hover:border-green-400/50 hover:bg-gray-700/80 hover:text-gray-300",
										{
											"animate-[fadeIn_0.5s_ease-in-out]": index < pillsPerPage,
										}
									)}
									key={index}
									onClick={() => onSuggestionClick(suggestion.text)}
									style={
										index < pillsPerPage
											? {
													animationDelay: `${index * 50}ms`,
												}
											: undefined
									}
									type="button"
								>
									<span className="line-clamp-1">{suggestion.title}</span>
								</button>
							))}
						</div>

						{hasMorePills ? (
							<Button
								className="group mt-2 bg-transparent px-6 py-2 text-sm text-gray-400 transition-all duration-300 hover:text-green-400"
								onClick={handleLoadMore}
							>
								<Typography className="flex items-center gap-2 font-medium">
									See all
									<svg
										className="size-4 transition-transform duration-300 group-hover:translate-y-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M19 9l-7 7-7-7"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</Typography>
							</Button>
						) : null}
					</div>
				</div>
			</main>

			{isModalOpen ? (
				<div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 p-2 sm:p-4">
					<div className="relative h-[95vh] w-full bg-black sm:h-[90vh] sm:w-[90vw] md:h-[85vh] md:w-[85vw]">
						<Button
							aria-label={tAi("modal.closeLabel")}
							className="absolute right-3 top-3 z-10 bg-transparent p-1.5 hover:bg-gray-200 sm:right-6 sm:top-6"
							onClick={handleCloseModal}
						>
							<svg
								className="size-4 text-gray-600 sm:size-5"
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

			<style>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</div>
	);
};
