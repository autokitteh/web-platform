import React, { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { iframeCommService } from "@services/iframeComm.service";
import { LoggerService } from "@services/logger.service";
import { aiChatbotUrl, namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { useChatbotIframeConnection, useEventListener } from "@src/hooks";
import { ChatbotIframeProps } from "@src/interfaces/components";
import { useOrganizationStore, useToastStore } from "@src/store";
import { MessageTypes } from "@src/types/iframeCommunication.type";

import { Button, Loader } from "@components/atoms";

export const ChatbotIframe = ({ title, width = "100%", height = "100%", className, onConnect }: ChatbotIframeProps) => {
	const { t } = useTranslation("chatbot", { keyPrefix: "iframeComponent" });
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const currentOrganization = useOrganizationStore((state) => state.currentOrganization);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const { isLoading, loadError, isIframeLoaded, handleIframeElementLoad, handleRetry } = useChatbotIframeConnection(
		iframeRef,
		onConnect
	);

	useEffect(() => {
		const navigationListener = iframeCommService.addListener(MessageTypes.EVENT, (message) => {
			if (message.type === MessageTypes.EVENT && "eventName" in message.data) {
				if (message.data.eventName === "NAVIGATE_TO_PROJECT" && "payload" in message.data) {
					const { projectId } = message.data.payload as { projectId: string };
					if (projectId) {
						navigate(`/projects/${projectId}`);
					}
				}
			}
		});

		return () => {
			iframeCommService.removeListener(navigationListener);
		};
	}, [navigate]);

	useEventListener(EventListenerName.iframeError, (event) => {
		const { message, error } = event.detail;
		addToast({
			message,
			type: "error",
		});
		LoggerService.error(namespaces.chatbot, error);
	});

	const renderLoadingIndicator = () => (
		<div className="flex size-full flex-col items-center justify-center">
			<div className="flex size-24 items-center justify-center rounded-full bg-gray-1250 p-2">
				<Loader className="mr-10" size="lg" />
			</div>
			<div className="mt-16 text-gray-500">{t("loading")}</div>
		</div>
	);

	const renderErrorDisplay = () => (
		<div className="flex size-full flex-col items-center justify-center">
			<div className="mb-4 text-error">{t("loadingError")}</div>
			<Button
				ariaLabel={t("ariaLabelRetry")}
				className="border-white px-4 py-2 font-semibold text-white hover:bg-black"
				onClick={handleRetry}
				variant="outline"
			>
				{t("retry")}
			</Button>
		</div>
	);

	if (!currentOrganization?.id) return null;

	const chatbotUrlWithOrgId = `${aiChatbotUrl}?orgId=${currentOrganization?.id}`;

	return (
		<div className="flex size-full flex-col items-center justify-center">
			{isLoading ? renderLoadingIndicator() : null}
			{!isLoading && loadError ? renderErrorDisplay() : null}
			{!loadError ? (
				<iframe
					className={className}
					height={height}
					onLoad={handleIframeElementLoad}
					ref={iframeRef}
					src={chatbotUrlWithOrgId}
					style={{
						border: "none",
						position: isLoading ? "absolute" : "relative",
						visibility: !isLoading && isIframeLoaded ? "visible" : "hidden",
						transition: "visibility 0s, opacity 0.3s ease-in-out",
					}}
					title={title}
					width={width}
				/>
			) : null}
		</div>
	);
};

export default ChatbotIframe;
