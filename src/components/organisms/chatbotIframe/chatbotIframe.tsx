import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";

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
import { LoadingOverlay } from "@components/molecules";

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
	const { setCollapsedProjectNavigation, cursorPositionPerProject, selectionPerProject } =
		useSharedBetweenProjectsStore();
	const [retryToastDisplayed, setRetryToastDisplayed] = useState(false);
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

	const handleConnectionCallback = useCallback(() => {
		onConnect?.();
		if (projectId && cursorPositionPerProject[projectId]) {
			const cursorData = cursorPositionPerProject[projectId];
			LoggerService.info(
				namespaces.chatbot,
				`Setting cursor positions for project ${projectId} file info: ${JSON.stringify(cursorData)}`
			);

			Object.entries(cursorData).forEach(([fileName, position]) => {
				iframeCommService.sendEvent(MessageTypes.SET_EDITOR_CURSOR_POSITION, {
					filename: fileName,
					line: position.lineNumber || 1,
				});
			});
		}

		// Send selection data if exists
		if (projectId && selectionPerProject[projectId]) {
			const selectionData = selectionPerProject[projectId];
			LoggerService.info(
				namespaces.chatbot,
				`Setting selections for project ${projectId}: ${Object.keys(selectionData).length} files with selections`
			);

			Object.entries(selectionData).forEach(([fileName, selection]) => {
				iframeCommService.sendEvent(MessageTypes.SET_EDITOR_CODE_SELECTION, {
					filename: fileName,
					...selection,
				});
			});
		}
	}, [onConnect, projectId, cursorPositionPerProject, selectionPerProject]);

	const { isLoading, loadError, isIframeLoaded, handleIframeElementLoad, handleRetry, isRetryLoading } =
		useChatbotIframeConnection(iframeRef, handleConnectionCallback, chatbotUrlWithOrgId);

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
		const directEventNavigationListener = iframeCommService.addListener(
			MessageTypes.NAVIGATE_TO_CONNECTION,
			(message) => {
				if (message.type === MessageTypes.NAVIGATE_TO_CONNECTION) {
					const { projectId, connectionId } = message.data as { connectionId: string; projectId: string };
					if (projectId && connectionId) {
						setCollapsedProjectNavigation(projectId, false);
						triggerEvent(EventListenerName.openConnectionFromChatbot);
						navigate(`/projects/${projectId}/connections/${connectionId}/edit`, {
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
			iframeCommService.removeListener(directEventNavigationListener);
		};
	}, [navigate, setCollapsedProjectNavigation]);

	useEventListener(EventListenerName.iframeError, (event) => {
		if (!retryToastDisplayed) {
			setRetryToastDisplayed(true);
			const { message } = event.detail;
			addToast({
				message,
				type: "error",
			});
		}
		LoggerService.error(namespaces.chatbot, event.detail?.error);
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
				className="absolute right-8 top-8 z-10 rounded-full bg-transparent p-1.5 hover:bg-gray-800"
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
			<iframe
				className={className}
				height={height}
				onLoad={handleIframeElementLoad}
				ref={iframeRef}
				src={chatbotUrlWithOrgId}
				style={{
					border: "none",
					position: isLoading ? "absolute" : "relative",
					visibility: !isLoading && isIframeLoaded && !loadError ? "visible" : "hidden",
					transition: "visibility 0s, opacity 0.3s ease-in-out",
				}}
				title={title}
				width={width}
			/>
			<LoadingOverlay className="z-50" isLoading={isRetryLoading} />
		</div>
	);
};

export default ChatbotIframe;
