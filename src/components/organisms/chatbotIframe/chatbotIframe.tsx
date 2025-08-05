/* eslint-disable no-console */
import React, { useEffect, useState, useRef, useCallback } from "react";

import { useNavigate } from "react-router-dom";

import { ChatbotLoadingStates } from "./chatbotLoadingStates";
import { ChatbotToolbar } from "./chatbotToolbar";
import { iframeCommService } from "@services/iframeComm.service";
import { aiChatbotUrl, defaultOpenedProjectFile, descopeProjectId } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent, useChatbotIframeConnection, useEventListener } from "@src/hooks";
import { ChatbotIframeProps } from "@src/interfaces/components";
import { useOrganizationStore, useProjectStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { MessageTypes } from "@src/types/iframeCommunication.type";
import { cn } from "@src/utilities";

import { ResizeButton } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules";

export const ChatbotIframe = ({
	title,
	width = "100%",
	height = "100%",
	className,
	onConnect,
	projectId,
	displayDeployButton = false,
	onBack,
	displayResizeButton = false,
	padded = false,
	hideCloseButton,
	isTransparent = false,
}: ChatbotIframeProps) => {
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const navigate = useNavigate();
	const { getProjectsList } = useProjectStore();

	const addToast = useToastStore((state) => state.addToast);
	const currentOrganization = useOrganizationStore((state) => state.currentOrganization);
	const { setExpandedProjectNavigation, selectionPerProject, chatbotHelperConfigMode } =
		useSharedBetweenProjectsStore();
	const [retryToastDisplayed, setRetryToastDisplayed] = useState(false);
	const [chatbotUrlWithOrgId, setChatbotUrlWithOrgId] = useState("");

	useEffect(() => {
		if (descopeProjectId && !currentOrganization?.id) return;

		const params = new URLSearchParams();
		if (currentOrganization?.id) {
			params.append("orgId", currentOrganization.id);
		}
		if (isTransparent) {
			params.append("bg-color", "1b1b1b");
		}
		if (projectId) {
			params.append("config-mode", chatbotHelperConfigMode[projectId] ? "true" : "false");
			params.append("project-id", projectId);
		}
		if (displayDeployButton) {
			params.append("display-deploy-button", displayDeployButton ? "true" : "false");
		}
		const url = `${aiChatbotUrl}?${params.toString()}`;

		if (url !== chatbotUrlWithOrgId) {
			console.debug("[Chatbot] URL changing from:", chatbotUrlWithOrgId, "to:", url);

			if (descopeProjectId && chatbotUrlWithOrgId && !currentOrganization?.id) {
				console.warn("[Chatbot] Preventing URL change that would remove orgId");
				return;
			}

			if (chatbotUrlWithOrgId && chatbotUrlWithOrgId !== "" && iframeRef.current) {
				console.debug("[Chatbot] Resetting iframe communication service due to URL change");
				iframeCommService.reset();
			}
			setChatbotUrlWithOrgId(url);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id, chatbotHelperConfigMode, projectId, displayDeployButton, aiChatbotUrl, isTransparent]);

	const handleConnectionCallback = useCallback(() => {
		onConnect?.();
		if (projectId && selectionPerProject[projectId]) {
			const selectionData = selectionPerProject[projectId];

			Object.entries(selectionData).forEach(([fileName, selection]) => {
				iframeCommService.sendEvent(MessageTypes.SET_EDITOR_CODE_SELECTION, {
					filename: fileName,
					...selection,
				});
			});
		}
	}, [onConnect, projectId, selectionPerProject]);

	const { isLoading, loadError, isIframeLoaded, handleIframeElementLoad, handleRetry, isRetryLoading } =
		useChatbotIframeConnection(iframeRef, handleConnectionCallback);

	useEffect(() => {
		const directNavigationListener = iframeCommService.addListener(MessageTypes.NAVIGATE_TO_PROJECT, (message) => {
			getProjectsList();
			if (message.type === MessageTypes.NAVIGATE_TO_PROJECT) {
				const { projectId } = message.data as { projectId: string };

				if (projectId) {
					setExpandedProjectNavigation(projectId, true);
					navigate(`/projects/${projectId}/code`, {
						state: {
							revealStatusSidebar: true,
							fileToOpen: defaultOpenedProjectFile,
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
						setExpandedProjectNavigation(projectId, true);
						triggerEvent(EventListenerName.openConnectionFromChatbot);
						navigate(`/projects/${projectId}/connections/${connectionId}/edit`);
					}
				}
			}
		);

		const varUpdatedListener = iframeCommService.addListener(MessageTypes.VAR_UPDATED, () => {
			if (projectId) {
				import("@store/cache/useCacheStore")
					.then(({ useCacheStore }) => {
						useCacheStore.getState().fetchVariables(projectId, true);
						return null;
					})
					.catch(() => {});
			}
		});

		return () => {
			console.debug("[Chatbot] Cleaning up iframe component listeners and resetting service");

			iframeCommService.removeListener(directNavigationListener);
			iframeCommService.removeListener(directEventNavigationListener);
			iframeCommService.removeListener(varUpdatedListener);

			iframeCommService.reset();
		};
	}, [navigate, setExpandedProjectNavigation, projectId, getProjectsList]);

	useEventListener(EventListenerName.iframeError, (event) => {
		if (!retryToastDisplayed) {
			setRetryToastDisplayed(true);
			const { message } = event.detail;
			addToast({
				message,
				type: "error",
			});
		}
		console.error("[Chatbot] Iframe error:", event.detail?.error);
	});

	if (descopeProjectId && !currentOrganization?.id) return null;

	const FrameTitle = chatbotHelperConfigMode[projectId!] ? "Project Status" : "AI Assistant";

	// Use the full URL as key to ensure iframe reloads when needed
	// This ensures proper handshake re-establishment

	const frameClass = cn("flex size-full flex-col items-center justify-center rounded-xl bg-gray-1100", {
		"p-6": padded,
	});

	const titleClass = cn("text-2xl font-bold text-white");

	return (
		<div className={frameClass}>
			<ChatbotToolbar hideCloseButton={hideCloseButton} />
			<div className={titleClass}>{FrameTitle}</div>
			<ChatbotLoadingStates isLoading={isLoading} loadError={loadError} onBack={onBack} onRetry={handleRetry} />
			{chatbotUrlWithOrgId ? (
				<iframe
					className={className}
					height={height}
					key={chatbotUrlWithOrgId}
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
			) : null}

			{displayResizeButton ? (
				<ResizeButton
					className="absolute left-0 right-auto top-1/2 z-[125] w-2 -translate-y-1/2 cursor-ew-resize px-1 hover:bg-white"
					direction="horizontal"
					id="chatbot-drawer-resize-button"
					resizeId="chatbot-drawer-resize"
				/>
			) : null}
			<LoadingOverlay className="z-50" isLoading={isRetryLoading} />
		</div>
	);
};

export default ChatbotIframe;
