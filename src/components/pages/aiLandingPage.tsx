import React, { useState, useMemo } from "react";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@enums/components";
import { CONFIG, iframeCommService } from "@services/iframeComm.service";
import { createAiLandingPagePrompts, initialPillsCount } from "@src/constants";
import { TourId } from "@src/enums";
import { useProjectActions } from "@src/hooks";
import { useProjectStore, useToastStore, useTourStore, useModalStore } from "@src/store";
import { cn, navigateToProject } from "@src/utilities";

import { AiTextArea, Button, Loader, Typography } from "@components/atoms";
import { AiChatModal } from "@components/organisms/modals";

export const AiLandingPage = () => {
	const { t: tAi } = useTranslation("dashboard", { keyPrefix: "ai" });
	const { t: tTours } = useTranslation("dashboard", { keyPrefix: "tours" });

	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const { projectsList } = useProjectStore();
	const { openModal } = useModalStore();
	const { triggerFileInput } = useProjectActions();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [pendingMessage, setPendingMessage] = useState<string>();
	const [visiblePillsCount, setVisiblePillsCount] = useState(initialPillsCount);
	const { startTour, isToursReady } = useTourStore();
	const [isStarting, setIsStarting] = useState(false);

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

	const handleStartTutorial = async (tourId: TourId) => {
		setIsStarting(true);
		const { data: newProjectData, error: newProjectError } = await startTour(tourId);
		if (!newProjectData?.projectId || newProjectError) {
			addToast({
				message: tTours("projectCreationFailed"),
				type: "error",
			});
			setIsStarting(false);
			return;
		}
		const { projectId, defaultFile } = newProjectData;

		navigateToProject(navigate, projectId, "/explorer", {
			fileToOpen: defaultFile,
		});
		setIsStarting(false);
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
		<div className="my-1.5 flex size-full overflow-hidden rounded-none md:rounded-2xl">
			<div className="flex flex-1 flex-col overflow-y-auto bg-[#1B1C1A] text-white">
				<header className="relative z-10 border-b border-gray-900/50 p-4 md:px-6">
					<div className="mx-auto flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3 md:gap-4">
							{showQuickstart ? (
								<Button
									className="flex w-full items-center rounded-full border border-green-400/30 bg-transparent px-4 py-2 text-base text-[#bcf870] hover:border-green-400/50 hover:bg-green-400/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto md:px-6 md:text-sm"
									disabled={isStarting || !isToursReady}
									onClick={() => handleStartTutorial(TourId.quickstart)}
								>
									{isStarting ? (
										<div className="flex h-6 w-[5.95rem] items-center justify-center">
											<Loader size="sm" />
										</div>
									) : (
										<Typography className="font-normal">Start Tutorial</Typography>
									)}
								</Button>
							) : null}
							<Button
								aria-label="Start from Template"
								className="w-full rounded-full border border-green-400/50 bg-transparent px-4 py-2 text-base text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10 sm:w-auto md:px-6 md:text-base"
								onClick={handleStartFromTemplate}
								title="Start from Template"
							>
								<Typography className="font-normal">Start from Template</Typography>
							</Button>
							<Button
								ariaLabel="New Project From Scratch"
								className="w-full rounded-full border border-green-400/50 bg-transparent px-4 py-2 text-base text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10 sm:w-auto md:px-6 md:text-base"
								onClick={handleNewProject}
								title="New Project From Scratch"
							>
								<Typography className="font-normal">New Project From Scratch</Typography>
							</Button>
							<Button
								aria-label="Import project from archive"
								className="w-full rounded-full border border-green-400/50 bg-transparent px-4 py-2 text-base text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10 sm:w-auto md:px-6 md:text-base"
								onClick={triggerFileInput}
								title="Import project from archive"
							>
								<Typography className="font-normal">Import</Typography>
							</Button>
						</div>
						<Button
							className="ml-2 w-full rounded-full bg-transparent text-base text-[#bcf870] hover:underline sm:w-auto"
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
							<Typography className="mb-8 text-xl text-[#fdfffa] sm:text-2xl md:text-3xl" element="h2">
								Create workflows and connect applications by chatting with AI
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
											"cursor-pointer rounded-full border border-gray-600/50 bg-gray-1200 p-1.5",
											"w-full text-sm text-gray-400 transition-all duration-300 sm:w-[calc(50%-0.375rem)] sm:text-sm md:w-[calc(18%-0.5rem)] md:text-sm",
											"hover:border-green-400/50 hover:bg-gray-1100 hover:text-gray-100"
										)}
										data-testid={`suggestion-pill-${suggestion.title.toLowerCase().replace(/ /g, "-")}`}
										key={index}
										onClick={() => onSuggestionClick(suggestion.text)}
										style={
											index < initialPillsCount
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
									className="group mt-2 bg-transparent text-sm text-gray-400 transition-all duration-300 hover:text-green-400"
									onClick={handleLoadMore}
								>
									<Typography className="flex items-center gap-2 font-medium">
										More
										<svg
											className="size-4"
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
				<AiChatModal isOpen={isModalOpen} onClose={handleCloseModal} onConnect={handleIframeConnect} />
			</div>
		</div>
	);
};
