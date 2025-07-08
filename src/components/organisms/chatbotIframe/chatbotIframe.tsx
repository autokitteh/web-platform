import React, { useEffect, useMemo, useRef } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { iframeCommService } from "@services/iframeComm.service";
import { LoggerService } from "@services/logger.service";
import { aiChatbotUrl, descopeProjectId, namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent, useChatbotIframeConnection, useEventListener } from "@src/hooks";
import { ChatbotIframeProps } from "@src/interfaces/components";
import { useOrganizationStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { MessageTypes } from "@src/types/iframeCommunication.type";

import { Button, Loader } from "@components/atoms";

export const ChatbotIframe = ({
	title,
	width = "100%",
	height = "100%",
	className,
	onConnect,
	projectId,
	onInit,
}: ChatbotIframeProps) => {
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const { t } = useTranslation("chatbot", { keyPrefix: "iframeComponent" });
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const currentOrganization = useOrganizationStore((state) => state.currentOrganization);
	const { setCollapsedProjectNavigation } = useSharedBetweenProjectsStore();

	const { isLoading, loadError, isIframeLoaded, handleIframeElementLoad, handleRetry } = useChatbotIframeConnection(
		iframeRef,
		onConnect
	);

	const chatbotUrlWithOrgId = useMemo(() => {
		const params = new URLSearchParams();
		if (currentOrganization?.id) {
			params.append("orgId", currentOrganization.id);
		}
		if (onInit) {
			params.append("on-init", onInit ? "true" : "false");
		}
		if (projectId) {
			params.append("project-id", projectId);
		}

		return `${aiChatbotUrl}?${params.toString()}`;
	}, [currentOrganization?.id, onInit, projectId]);

	useEffect(() => {
		const directNavigationListener = iframeCommService.addListener(MessageTypes.NAVIGATE_TO_PROJECT, (message) => {
			if (message.type === MessageTypes.NAVIGATE_TO_PROJECT) {
				const { projectId } = message.data as { projectId: string };
				if (projectId) {
					setCollapsedProjectNavigation(projectId, false);
					navigate(`/projects/${projectId}`, {
						state: {
							fromChatbot: true,
						},
					});
				}
			}
		});

		const directConnectionsNavigationListener = iframeCommService.addListener(
			MessageTypes.NAVIGATE_TO_CONNECTION,
			(message) => {
				if (message.type === MessageTypes.NAVIGATE_TO_CONNECTION) {
					const { connectionId, projectId: messageProjectId } = message.data as {
						connectionId: string;
						projectId: string;
					};
					if (connectionId && messageProjectId) {
						setCollapsedProjectNavigation(connectionId, false);
						navigate(`/projects/${messageProjectId}/connections/${connectionId}`, {
							state: {
								fromChatbot: true,
							},
						});
					}
				}
			}
		);

		return () => {
			iframeCommService.removeListener(directNavigationListener);
			iframeCommService.removeListener(directConnectionsNavigationListener);
		};
	}, [navigate, setCollapsedProjectNavigation]);

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

	if (descopeProjectId && !currentOrganization?.id) return null;

	const hideChatbotIframe = () => {
		triggerEvent(EventListenerName.toggleIntroChatBot);
		triggerEvent(EventListenerName.toggleDashboardChatBot);
		triggerEvent(EventListenerName.toggleProjectChatBot);
	};

	return (
		<div className="flex size-full flex-col items-center justify-center">
			<Button
				aria-label="Close AI Chat"
				className="absolute right-7 top-7 z-10 rounded-full bg-transparent p-1.5 hover:bg-gray-800"
				onClick={hideChatbotIframe}
			>
				<svg
					className="size-5 text-white"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
				</svg>
			</Button>
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
