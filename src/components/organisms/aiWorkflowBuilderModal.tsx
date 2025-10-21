import React, { useState } from "react";

import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { CONFIG, iframeCommService } from "@services/iframeComm.service";
import { cn } from "@src/utilities";

import { AiTextArea, Button } from "@components/atoms";
import { ChatbotIframe } from "@components/organisms/chatbotIframe/chatbotIframe";

interface AiWorkflowBuilderModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const AiWorkflowBuilderModal = ({ isOpen, onClose }: AiWorkflowBuilderModalProps) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "ai" });
	const [pendingMessage, setPendingMessage] = useState<string>();
	const [showChatbot, setShowChatbot] = useState(false);

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

	const onSubmit = (data: { message: string }) => {
		setShowChatbot(true);
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
		setShowChatbot(false);
		setPendingMessage(undefined);
		onClose();
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
			clearErrors("message");
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 p-4">
			{showChatbot ? (
				<div className="relative size-[85%] rounded-lg bg-black">
					<Button
						aria-label={t("modal.closeLabel")}
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
						title={t("modal.assistantTitle")}
					/>
				</div>
			) : (
				<div className="relative w-full max-w-4xl rounded-2xl border-2 border-[rgba(126,211,33,0.3)] bg-[rgba(26,26,26,0.95)] p-8 shadow-[0_20px_60px_rgba(126,211,33,0.1)] backdrop-blur-[10px] md:p-12">
					<Button
						aria-label={t("modal.closeLabel")}
						className="absolute right-4 top-4 rounded-full bg-transparent p-1.5 hover:bg-gray-200"
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

					<h2 className="mb-6 text-center text-3xl font-bold text-white">{t("modal.title")}</h2>

					<form onSubmit={handleSubmit(onSubmit)}>
						<AiTextArea
							errors={errors}
							prompt={prompt}
							{...register("message", {
								required: t("aiPage.requiredMessage"),
								onChange: (e) => {
									if (errors.message && e.target.value.trim()) {
										clearErrors("message");
									}
								},
							})}
						/>
					</form>

					<div className="mt-6 space-y-2">
						<p className="text-center text-sm text-gray-400">{t("modal.examplesLabel")}</p>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
							{[
								{
									title: t("examples.webhookSms.title"),
									text: t("examples.webhookSms.text"),
								},
								{
									title: t("examples.uptimeMonitor.title"),
									text: t("examples.uptimeMonitor.text"),
								},
								{
									title: t("examples.redditTracker.title"),
									text: t("examples.redditTracker.text"),
								},
								{
									title: t("examples.hackerNewsMonitor.title"),
									text: t("examples.hackerNewsMonitor.text"),
								},
							].map((action, index) => (
								<button
									className={cn(
										"flex w-full cursor-pointer items-center justify-center rounded-full border border-gray-600/50 bg-gray-800/60 px-2 py-1.5 text-center text-xs text-gray-300",
										"transition-all duration-300 ease-in-out hover:border-green-400/50 hover:bg-gray-700/80 sm:text-sm"
									)}
									key={index}
									onClick={() => onSuggestionClick(action.text)}
								>
									<span className="truncate">{action.title}</span>
								</button>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
