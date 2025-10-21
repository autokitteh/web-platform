import React, { useState } from "react";

import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@enums/components";
import { CONFIG, iframeCommService } from "@services/iframeComm.service";
import { welcomeCards, workflowExamples } from "@src/constants";
import type { ExampleCategory } from "@src/constants";
import { TourId } from "@src/enums";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useProjectStore, useTemplatesStore, useToastStore, useTourStore, useModalStore } from "@src/store";
import { cn } from "@src/utilities";

import { AiTextArea, Button, Typography } from "@components/atoms";
import { ProgressIndicator, WelcomeCard } from "@components/molecules";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { ChatbotIframe } from "@components/organisms/chatbotIframe/chatbotIframe";
import { WelcomeVideoModal } from "@components/organisms/dashboard";
import { NewProjectModal } from "@components/organisms/modals/newProjectModal";

type TabType = "aiBuilder" | "browseExamples";

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
	const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
		describe: false,
		preview: false,
		deploy: false,
		share: false,
	});
	const [activeTab, setActiveTab] = useState<TabType>("aiBuilder");
	const [selectedCategory, setSelectedCategory] = useState<ExampleCategory>("all");

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
		setCompletedSteps((prev) => ({ ...prev, describe: true }));
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

	const progressSteps = [
		{
			number: 1,
			label: tAi("progress.describe"),
			completed: completedSteps.describe,
			active: !completedSteps.describe,
		},
		{
			number: 2,
			label: tAi("progress.preview"),
			completed: completedSteps.preview,
			active: completedSteps.describe && !completedSteps.preview,
		},
		{
			number: 3,
			label: tAi("progress.deploy"),
			completed: completedSteps.deploy,
			active: completedSteps.preview && !completedSteps.deploy,
		},
		{
			number: 4,
			label: tAi("progress.share"),
			completed: completedSteps.share,
			active: completedSteps.deploy && !completedSteps.share,
		},
	];

	const filteredExamples =
		selectedCategory === "all"
			? workflowExamples
			: workflowExamples.filter((example) => example.category === selectedCategory);

	const categories: { id: ExampleCategory; label: string }[] = [
		{ id: "all", label: tAi("categories.all") },
		{ id: "integrations", label: tAi("categories.integrations") },
		{ id: "alerts", label: tAi("categories.alerts") },
		{ id: "dataSync", label: tAi("categories.dataSync") },
	];

	return (
		<div className="scrollbar relative flex min-h-screen flex-col overflow-auto rounded-b-lg bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] text-center md:mt-2 md:rounded-2xl">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(126,211,33,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(126,211,33,0.05)_0%,transparent_50%)]" />
			</div>

			<LoadingOverlay isLoading={isLoading} />
			<header className="relative z-10 border-b border-gray-900">
				<div className="flex items-center justify-between p-6 pb-3">
					<div className="flex items-center">
						<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
							{isWelcomePage ? tAi("welcomeTitle") : tAi("title")}
						</Typography>
					</div>
					<Button className="text-sm text-green-800 hover:underline" onClick={() => navigate("/intro")}>
						{tAi("learnMore")}
					</Button>
				</div>
			</header>
			<main className={contentClass}>
				<section className="flex size-full min-h-0 flex-col items-center">
					<div className="grow" />
					<div className="flex shrink-0 justify-center gap-4 px-6 pb-6">
						<button
							className={cn(
								"rounded-lg px-8 py-3 text-base font-semibold transition-all duration-200",
								activeTab === "aiBuilder"
									? "bg-green-600 text-white shadow-lg"
									: "bg-gray-800 text-gray-400 hover:bg-gray-700"
							)}
							onClick={() => setActiveTab("aiBuilder")}
						>
							{tAi("tabs.aiBuilder")}
						</button>
						<button
							className={cn(
								"rounded-lg px-8 py-3 text-base font-semibold transition-all duration-200",
								activeTab === "browseExamples"
									? "bg-green-600 text-white shadow-lg"
									: "bg-gray-800 text-gray-400 hover:bg-gray-700"
							)}
							onClick={() => setActiveTab("browseExamples")}
						>
							{tAi("tabs.browseExamples")}
						</button>
					</div>
					<div className="flex w-4/5 max-w-[1440px] shrink-0 flex-col px-6 py-8 md:px-16">
						{activeTab === "aiBuilder" ? (
							<div className="w-full animate-[fadeInUp_0.8s_ease_forwards] rounded-3xl border-2 border-[rgba(126,211,33,0.3)] bg-[rgba(26,26,26,0.8)] p-6 text-center shadow-[0_20px_60px_rgba(126,211,33,0.1)] backdrop-blur-[10px] md:p-10">
								<form onSubmit={handleSubmit(onSubmit)}>
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
									<div className="mt-4 flex justify-center">
										<Button
											className="rounded-lg bg-green-600 px-8 py-3 text-base font-semibold text-white hover:bg-green-700"
											type="submit"
										>
											{tAi("aiBuilder.cta")}
										</Button>
									</div>
								</form>

								<div className="mt-6 space-y-2">
									<Typography className="text-sm text-gray-500">Quick Examples:</Typography>
									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
										{workflowExamples.slice(0, 4).map((example) => (
											<button
												className="flex w-full cursor-pointer items-center justify-center rounded-full border border-gray-600/50 bg-gray-800/60 px-2 py-1.5 text-center text-xs text-gray-300 transition-all duration-300 ease-in-out hover:border-green-400/50 hover:bg-gray-700/80 sm:text-sm"
												key={example.id}
												onClick={() => onSuggestionClick(tAi(example.textKey))}
											>
												<span className="truncate">{tAi(example.titleKey)}</span>
											</button>
										))}
									</div>
								</div>

								<Typography className="mt-4 text-sm text-green-600">
									{tAi("aiBuilder.deployMessage")}
								</Typography>
							</div>
						) : (
							<>
								<div className="shrink-0 text-center">
									<h1 className="animate-[fadeInUp_0.8s_ease_forwards] text-[2.5rem] font-black leading-[1.2] text-white md:text-[3rem]">
										{tAi("browseExamples.title")}
									</h1>
									<p className="mt-4 animate-[fadeInUp_0.6s_ease_forwards] text-lg text-gray-400">
										{tAi("browseExamples.subtitle")}
									</p>
								</div>

								<div className="my-8 flex justify-center gap-3">
									{categories.map((category) => (
										<button
											className={cn(
												"rounded-full px-6 py-2 text-sm font-medium transition-all duration-200",
												selectedCategory === category.id
													? "bg-green-600 text-white shadow-md"
													: "bg-gray-800 text-gray-400 hover:bg-gray-700"
											)}
											key={category.id}
											onClick={() => setSelectedCategory(category.id)}
										>
											{category.label}
										</button>
									))}
								</div>

								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{filteredExamples.map((example) => (
										<div
											className="group rounded-2xl border-2 border-gray-800 bg-[rgba(26,26,26,0.8)] p-6 transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(126,211,33,0.2)]"
											key={example.id}
										>
											<Typography className="mb-3 text-lg font-bold text-white">
												{tAi(example.titleKey)}
											</Typography>
											<Typography className="mb-4 line-clamp-3 text-sm text-gray-400">
												{tAi(example.textKey)}
											</Typography>
											<div className="mb-4 flex flex-wrap gap-2">
												{example.tags.map((tag) => (
													<span
														className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-300"
														key={tag}
													>
														{tag}
													</span>
												))}
											</div>
											<Button
												className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
												onClick={() => {
													setValue("message", tAi(example.textKey));
													setActiveTab("aiBuilder");
													handleSubmit(onSubmit)();
												}}
											>
												{tAi("browseExamples.cta")}
											</Button>
										</div>
									))}
								</div>
							</>
						)}
					</div>
					<div className="grow" />
				</section>
			</main>
		</div>
	);
};
