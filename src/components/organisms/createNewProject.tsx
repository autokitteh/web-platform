import React, { useMemo, useState } from "react";

import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { CONFIG, iframeCommService } from "@services/iframeComm.service";
import { workflowExamples } from "@src/constants";
import { useProjectActions } from "@src/hooks";
import { useProjectStore, useTemplatesStore, useToastStore } from "@src/store";
import { cn, validateEntitiesName } from "@src/utilities";

import { AiTextArea, Button, ErrorMessage, Input, Loader, Typography } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { ChatbotIframe } from "@components/organisms/chatbotIframe/chatbotIframe";
import { TemplatesCatalog } from "@components/organisms/dashboard/templates/catalog";
import { NewProjectModal } from "@components/organisms/modals/newProjectModal";

type Mode = "ai" | "templates" | "scratch";

export const CreateNewProject = ({ isWelcomePage }: { isWelcomePage?: boolean }) => {
	const { t: tAi } = useTranslation("dashboard", { keyPrefix: "ai" });
	const { t: tModals } = useTranslation("modals", { keyPrefix: "newProject" });
	const navigate = useNavigate();
	const { isLoading } = useTemplatesStore();
	const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_isIframeLoaded, setIsIframeLoaded] = useState(false);
	const [pendingMessage, setPendingMessage] = useState<string>();
	const { projectsList } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);
	const [responseError, setResponseError] = useState("");
	const { handleCreateProject, isCreatingNewProject } = useProjectActions();

	const {
		register: registerAI,
		handleSubmit: handleSubmitAI,
		setValue,
		clearErrors: clearErrorsAI,
		formState: { errors: errorsAI },
		watch,
	} = useForm<{ message: string }>({
		mode: "onChange",
		defaultValues: {
			message: "",
		},
	});
	const prompt = watch("message");

	const {
		register: registerScratch,
		handleSubmit: handleSubmitScratch,
		formState: { errors: errorsScratch },
	} = useForm<{ projectName: string }>({
		mode: "onChange",
		defaultValues: {
			projectName: "",
		},
	});

	const onSubmitAI = (data: { message: string }) => {
		setIsModalOpen(true);
		setPendingMessage(data.message);
	};

	const onSubmitScratch = async (data: { projectName: string }) => {
		const { projectName } = data;
		const { error } = await handleCreateProject(projectName);

		if (error) {
			addToast({
				message: tModals("errorCreatingProject"),
				type: "error",
			});
			setResponseError(tModals("errorCreatingProject"));
			return;
		}
		addToast({
			message: "Project created successfully",
			type: "success",
		});
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

	const onSuggestionClick = (suggestion: string) => {
		flushSync(() => {
			setValue("message", suggestion);
		});

		const textareaElement = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
		if (textareaElement) {
			textareaElement.focus();
		}
		if (suggestion) {
			clearErrorsAI("message");
		}
	};

	const renderLargeButtons = () => (
		<div className="flex justify-center gap-6">
			<button
				className="group relative overflow-hidden rounded-2xl border-2 border-green-600 bg-gradient-to-br from-green-600 to-green-700 px-12 py-6 shadow-[0_0_30px_rgba(126,211,33,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(126,211,33,0.5)]"
				onClick={() => setSelectedMode("ai")}
			>
				<div className="relative z-10 flex flex-col items-center gap-2">
					<svg
						className="size-12 text-white"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<path
							d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22l-.394-1.433a2.25 2.25 0 00-1.423-1.423L13.25 19l1.433-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.433a2.25 2.25 0 001.423 1.423L19.75 19l-1.433.394a2.25 2.25 0 00-1.423 1.423z"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<Typography className="text-xl font-bold text-white">{tAi("tabs.aiBuilder")}</Typography>
					<Typography className="text-sm text-green-400">Build with AI</Typography>
				</div>
				<div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-500 to-green-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			</button>

			<button
				className="group relative overflow-hidden rounded-2xl border-2 border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 px-12 py-6 shadow-lg transition-all duration-300 hover:scale-105 hover:border-green-600 hover:shadow-[0_0_30px_rgba(126,211,33,0.2)]"
				onClick={() => setSelectedMode("templates")}
			>
				<div className="relative z-10 flex flex-col items-center gap-2">
					<svg
						className="size-12 text-gray-400 transition-colors group-hover:text-green-500"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<path
							d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<Typography className="text-xl font-bold text-white">Templates Catalog</Typography>
					<Typography className="text-sm text-gray-400 transition-colors group-hover:text-green-400">
						Explore Templates
					</Typography>
				</div>
				<div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-600/10 to-green-700/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			</button>

			<button
				className="group relative overflow-hidden rounded-2xl border-2 border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 px-12 py-6 shadow-lg transition-all duration-300 hover:scale-105 hover:border-green-600 hover:shadow-[0_0_30px_rgba(126,211,33,0.2)]"
				onClick={() => setSelectedMode("scratch")}
			>
				<div className="relative z-10 flex flex-col items-center gap-2">
					<svg
						className="size-12 text-gray-400 transition-colors group-hover:text-green-500"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						viewBox="0 0 24 24"
					>
						<path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					<Typography className="text-xl font-bold text-white">Create from Scratch</Typography>
					<Typography className="text-sm text-gray-400 transition-colors group-hover:text-green-400">
						Start Fresh
					</Typography>
				</div>
				<div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-600/10 to-green-700/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			</button>
		</div>
	);

	const renderSmallTabs = () => (
		<div className="mb-8 flex justify-center gap-3">
			<button
				className={cn(
					"rounded-lg border-2 px-6 py-3 text-sm font-semibold transition-all duration-300",
					selectedMode === "ai"
						? "border-green-600 bg-green-600 text-white shadow-lg"
						: "border-gray-700 bg-gray-800 text-gray-300 hover:border-green-600 hover:text-white"
				)}
				onClick={() => setSelectedMode("ai")}
			>
				AI Builder
			</button>
			<button
				className={cn(
					"rounded-lg border-2 px-6 py-3 text-sm font-semibold transition-all duration-300",
					selectedMode === "templates"
						? "border-green-600 bg-green-600 text-white shadow-lg"
						: "border-gray-700 bg-gray-800 text-gray-300 hover:border-green-600 hover:text-white"
				)}
				onClick={() => setSelectedMode("templates")}
			>
				Templates Catalog
			</button>
			<button
				className={cn(
					"rounded-lg border-2 px-6 py-3 text-sm font-semibold transition-all duration-300",
					selectedMode === "scratch"
						? "border-green-600 bg-green-600 text-white shadow-lg"
						: "border-gray-700 bg-gray-800 text-gray-300 hover:border-green-600 hover:text-white"
				)}
				onClick={() => setSelectedMode("scratch")}
			>
				From Scratch
			</button>
		</div>
	);

	const renderAIContent = () => (
		<div className="mx-auto w-full max-w-[800px] animate-[fadeInUp_0.8s_ease_forwards] rounded-3xl border-2 border-[rgba(126,211,33,0.3)] bg-[rgba(26,26,26,0.8)] p-6 text-center shadow-[0_20px_60px_rgba(126,211,33,0.1)] backdrop-blur-[10px] md:p-10">
			<form onSubmit={handleSubmitAI(onSubmitAI)}>
				<AiTextArea
					errors={errorsAI}
					prompt={prompt}
					{...registerAI("message", {
						required: tAi("aiPage.requiredMessage"),
						onChange: (e) => {
							if (errorsAI.message && e.target.value.trim()) {
								clearErrorsAI("message");
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

			<Typography className="mt-4 text-sm text-green-600">{tAi("aiBuilder.deployMessage")}</Typography>
		</div>
	);

	const renderScratchContent = () => (
		<div className="mx-auto w-full max-w-[800px] animate-[fadeInUp_0.8s_ease_forwards] rounded-3xl border-2 border-[rgba(126,211,33,0.3)] bg-[rgba(26,26,26,0.8)] p-6 text-center shadow-[0_20px_60px_rgba(126,211,33,0.1)] backdrop-blur-[10px] md:p-10">
			<form onSubmit={handleSubmitScratch(onSubmitScratch)}>
				<h3 className="mb-6 text-2xl font-bold text-white">{tModals("title")}</h3>

				<Input
					label={tModals("projectName")}
					placeholder={tModals("inputPlaceholder")}
					variant="light"
					{...registerScratch("projectName", {
						required: tModals("nameRequired"),
						validate: (value) => validateEntitiesName(value, projectNamesSet) || true,
					})}
					isError={!!errorsScratch.projectName}
				/>
				{errorsScratch.projectName ? (
					<ErrorMessage className="relative mt-0.5">{errorsScratch.projectName.message}</ErrorMessage>
				) : null}
				{responseError ? <ErrorMessage className="relative mt-0.5">{responseError}</ErrorMessage> : null}

				<div className="mt-8 flex justify-center">
					<Button
						ariaLabel={tModals("createButton")}
						className="rounded-lg bg-green-600 px-8 py-3 text-base font-semibold text-white hover:bg-green-700"
						disabled={isCreatingNewProject || !!errorsScratch.projectName}
						type="submit"
					>
						{isCreatingNewProject ? <Loader className="mr-2" size="sm" /> : null}
						{tModals("createButton")}
					</Button>
				</div>
			</form>
		</div>
	);

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
			<main className="relative z-10 flex grow flex-col items-center justify-center overflow-auto">
				<section className="flex w-full justify-center px-6 md:px-16">
					<div className="w-full max-w-[1440px]">
						{!selectedMode ? (
							<>
								<div className="mb-12 text-center">
									<h1 className="animate-[fadeInUp_0.8s_ease_forwards] text-[2.5rem] font-black leading-[1.2] text-white md:text-[3rem]">
										{tAi("aiBuilder.title")}
									</h1>
								</div>
								{renderLargeButtons()}
							</>
						) : (
							<>
								{renderSmallTabs()}
								{selectedMode === "ai" ? renderAIContent() : null}
								{selectedMode === "templates" ? (
									<div className="w-full">
										<TemplatesCatalog />
									</div>
								) : null}
								{selectedMode === "scratch" ? renderScratchContent() : null}
							</>
						)}
					</div>
				</section>
			</main>
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
