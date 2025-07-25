import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";

import { useNavigate } from "react-router-dom";

import { ChatbotLoadingStates } from "./chatbotLoadingStates";
import { ChatbotToolbar } from "./chatbotToolbar";
import { iframeCommService } from "@services/iframeComm.service";
import { LoggerService } from "@services/logger.service";
import { aiChatbotUrl, defaultOpenedProjectFile, descopeProjectId, namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent, useChatbotIframeConnection, useEventListener } from "@src/hooks";
import { ChatbotIframeProps } from "@src/interfaces/components";
import { useOrganizationStore, useProjectStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { MessageTypes } from "@src/types/iframeCommunication.type";

import { LoadingOverlay } from "@components/molecules";
import { ErrorBoundary } from "@components/molecules/errorBoundary";

export const ChatbotIframe = ({
	title,
	width = "100%",
	height = "100%",
	className,
	onConnect,
	projectId,
	configMode,
	hideCloseButton,
	hideHistoryButton = false,
	showFullscreenToggle = false,
	// isFullscreen = false,
	onToggleFullscreen,
	displayDeployButton = false,
}: ChatbotIframeProps) => {
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const navigate = useNavigate();
	const { getProjectsList } = useProjectStore();

	const addToast = useToastStore((state) => state.addToast);
	const currentOrganization = useOrganizationStore((state) => state.currentOrganization);
	const { setCollapsedProjectNavigation, cursorPositionPerProject, selectionPerProject, isChatbotFullScreen } =
		useSharedBetweenProjectsStore();
	const [retryToastDisplayed, setRetryToastDisplayed] = useState(false);
	const chatbotUrlWithOrgId = useMemo(() => {
		const params = new URLSearchParams();
		if (currentOrganization?.id) {
			params.append("orgId", currentOrganization.id);
		}
		if (configMode) {
			params.append("config-mode", configMode ? "true" : "false");
		}
		if (projectId) {
			params.append("project-id", projectId);
		}
		if (displayDeployButton) {
			params.append("display-deploy-button", displayDeployButton ? "true" : "false");
		}

		return `${aiChatbotUrl}?${params.toString()}`;
	}, [currentOrganization?.id, configMode, projectId, displayDeployButton]);

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
			LoggerService.info(namespaces.chatbot, `Direct navigation message received: ${JSON.stringify(message)}`);
			getProjectsList();
			if (message.type === MessageTypes.NAVIGATE_TO_PROJECT) {
				const { projectId } = message.data as { projectId: string };

				LoggerService.info(namespaces.chatbot, `Direct navigation to project: ${projectId}`);
				if (projectId) {
					setCollapsedProjectNavigation(projectId, false);
					navigate(`/projects/${projectId}`, {
						state: {
							fromChatbot: true,
							fileToOpen: defaultOpenedProjectFile,
						},
					});
				}
			}
		});
		const directEventNavigationListener = iframeCommService.addListener(
			MessageTypes.NAVIGATE_TO_CONNECTION,
			(message) => {
				LoggerService.info(
					namespaces.chatbot,
					`Direct navigation message received connection: ${JSON.stringify(message)}`
				);

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

		const varUpdatedListener = iframeCommService.addListener(MessageTypes.VAR_UPDATED, () => {
			// Refetch variables for the current project
			if (projectId) {
				// Dynamically import to avoid circular deps if any
				import("@store/cache/useCacheStore")
					.then(({ useCacheStore }) => {
						useCacheStore.getState().fetchVariables(projectId, true);
						return null;
					})
					.catch(() => {});
			}
		});

		return () => {
			iframeCommService.removeListener(directNavigationListener);
			iframeCommService.removeListener(directEventNavigationListener);
			iframeCommService.removeListener(varUpdatedListener);
		};
	}, [navigate, setCollapsedProjectNavigation, projectId, getProjectsList]);

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

	if (descopeProjectId && !currentOrganization?.id) return null;

	const isFullscreen = isChatbotFullScreen[projectId!] || false;

	return (
		<ErrorBoundary>
			<div className="flex size-full flex-col items-center justify-center">
				<ChatbotToolbar
					configMode={configMode}
					hideCloseButton={hideCloseButton}
					hideHistoryButton={hideHistoryButton}
					isFullscreen={isFullscreen}
					onToggleFullscreen={onToggleFullscreen}
					showFullscreenToggle={showFullscreenToggle}
				/>
				<ChatbotLoadingStates isLoading={isLoading} loadError={loadError} onRetry={handleRetry} />
				<iframe
					className={className}
					height={height}
					onLoad={handleIframeElementLoad}
					ref={iframeRef}
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-storage-access-by-user-activation"
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
		</ErrorBoundary>
	);
};

export default ChatbotIframe;
