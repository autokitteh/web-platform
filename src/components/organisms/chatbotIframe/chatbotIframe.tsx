import React, { useEffect, useState, useRef, useCallback, useMemo, RefObject } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ChatbotLoadingStates } from "./chatbotLoadingStates";
import { ChatbotToolbar } from "./chatbotToolbar";
import { iframeCommService } from "@services/iframeComm.service";
import { LoggerService } from "@services/logger.service";
import { aiChatbotUrl, defaultOpenedProjectFile, descopeProjectId, isDevelopment, namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent, useChatbotIframeConnection, useEventListener } from "@src/hooks";
import { ChatbotIframeProps } from "@src/interfaces/components";
import { useOrganizationStore, useProjectStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { MessageTypes } from "@src/types/iframeCommunication.type";
import { cn } from "@src/utilities";
import { useCacheStore } from "@store/cache/useCacheStore";

import { ResizeButton } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules";

// Type guards for message validation
interface NavigateToProjectMessage {
	type: MessageTypes.NAVIGATE_TO_PROJECT;
	data: { projectId: string };
}

interface NavigateToConnectionMessage {
	type: MessageTypes.NAVIGATE_TO_CONNECTION;
	data: { connectionId: string; projectId: string };
}

interface VarUpdatedMessage {
	type: MessageTypes.VAR_UPDATED;
	data?: unknown;
}

const isNavigateToProjectMessage = (message: any): message is NavigateToProjectMessage => {
	return message.type === MessageTypes.NAVIGATE_TO_PROJECT && typeof message.data?.projectId === "string";
};

const isNavigateToConnectionMessage = (message: any): message is NavigateToConnectionMessage => {
	return (
		message.type === MessageTypes.NAVIGATE_TO_CONNECTION &&
		typeof message.data?.projectId === "string" &&
		typeof message.data?.connectionId === "string"
	);
};

const isVarUpdatedMessage = (message: any): message is VarUpdatedMessage => {
	return message.type === MessageTypes.VAR_UPDATED;
};

// URL comparison utilities
const urlParamsToCheck = ["org-id", "project-id", "config-mode", "display-deploy-button", "bg-color"] as const;

const compareUrlParams = (oldUrl: string, newUrl: string): boolean => {
	try {
		const oldUrlObj = new URL(oldUrl);
		const newUrlObj = new URL(newUrl);

		return urlParamsToCheck.some(
			(param) => oldUrlObj.searchParams.get(param) !== newUrlObj.searchParams.get(param)
		);
	} catch (error) {
		LoggerService.warn(namespaces.chatbot, `Failed to compare URLs: ${error}`);
		return oldUrl !== newUrl;
	}
};

const shouldResetIframe = (oldUrl: string, newUrl: string, iframeRef: RefObject<HTMLIFrameElement>): boolean => {
	if (!oldUrl || oldUrl === "" || !iframeRef.current) {
		return false;
	}

	if (iframeRef.current.src !== newUrl) {
		return true;
	}

	return compareUrlParams(oldUrl, newUrl);
};

// Cache store operations
const handleVariableRefresh = (projectId: string): void => {
	try {
		useCacheStore.getState().fetchVariables(projectId, true);
	} catch (error) {
		LoggerService.error(namespaces.chatbot, `Failed to refresh variables for project ${projectId}: ${error}`);
	}
};

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
	const { t } = useTranslation("chatbot");
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const navigate = useNavigate();
	const { getProjectsList } = useProjectStore();

	const addToast = useToastStore((state) => state.addToast);
	const currentOrganization = useOrganizationStore((state) => state.currentOrganization);
	const setExpandedProjectNavigation = useSharedBetweenProjectsStore((state) => state.setExpandedProjectNavigation);
	const selectionPerProject = useSharedBetweenProjectsStore((state) => state.selectionPerProject);
	const chatbotHelperConfigMode = useSharedBetweenProjectsStore((state) => state.chatbotHelperConfigMode);
	const [retryToastDisplayed, setRetryToastDisplayed] = useState(false);
	const [chatbotUrlWithOrgId, setChatbotUrlWithOrgId] = useState("");

	const currentProjectConfigMode = useMemo(() => {
		return projectId ? chatbotHelperConfigMode[projectId] : false;
	}, [projectId, chatbotHelperConfigMode]);

	const computedChatbotUrl = useMemo(() => {
		if (descopeProjectId && !currentOrganization?.id && !isDevelopment) return "";

		const params = new URLSearchParams();
		if (currentOrganization?.id) {
			params.append("org-id", currentOrganization.id);
		}
		if (isTransparent) {
			params.append("bg-color", "1b1b1b");
		}
		if (projectId) {
			params.append("config-mode", currentProjectConfigMode ? "true" : "false");
			params.append("project-id", projectId);
		}
		if (displayDeployButton) {
			params.append("display-deploy-button", displayDeployButton ? "true" : "false");
		}
		return `${aiChatbotUrl}?${params.toString()}`;
	}, [currentOrganization?.id, currentProjectConfigMode, projectId, displayDeployButton, isTransparent]);

	useEffect(() => {
		if (!computedChatbotUrl || computedChatbotUrl === chatbotUrlWithOrgId) return;

		LoggerService.debug(
			namespaces.chatbot,
			t("debug.urlChanging", { oldUrl: chatbotUrlWithOrgId, newUrl: computedChatbotUrl })
		);

		if (descopeProjectId && chatbotUrlWithOrgId && !currentOrganization?.id && !isDevelopment) {
			LoggerService.debug(namespaces.chatbot, t("debug.preventingOrgIdRemoval"));
			return;
		}

		const shouldReset = shouldResetIframe(chatbotUrlWithOrgId, computedChatbotUrl, iframeRef);

		if (shouldReset) {
			LoggerService.debug(namespaces.chatbot, t("debug.resettingService"));
			iframeCommService.reset();
		}
		setChatbotUrlWithOrgId(computedChatbotUrl);
	}, [computedChatbotUrl, chatbotUrlWithOrgId, currentOrganization?.id, t]);

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
			try {
				getProjectsList();
				if (isNavigateToProjectMessage(message)) {
					const { projectId } = message.data;

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
			} catch (error) {
				LoggerService.error(namespaces.chatbot, `Failed to handle project navigation: ${error}`);
			}
		});

		const directEventNavigationListener = iframeCommService.addListener(
			MessageTypes.NAVIGATE_TO_CONNECTION,
			(message) => {
				try {
					if (isNavigateToConnectionMessage(message)) {
						const { projectId, connectionId } = message.data;
						if (projectId && connectionId) {
							setExpandedProjectNavigation(projectId, true);
							triggerEvent(EventListenerName.openConnectionFromChatbot);
							navigate(`/projects/${projectId}/connections/${connectionId}/edit`);
						}
					}
				} catch (error) {
					LoggerService.error(namespaces.chatbot, `Failed to handle connection navigation: ${error}`);
				}
			}
		);

		const varUpdatedListener = iframeCommService.addListener(MessageTypes.VAR_UPDATED, (message) => {
			try {
				if (isVarUpdatedMessage(message) && projectId) {
					handleVariableRefresh(projectId);
				}
			} catch (error) {
				LoggerService.error(namespaces.chatbot, `Failed to handle variable update: ${error}`);
			}
		});

		return () => {
			LoggerService.debug(namespaces.chatbot, t("debug.cleanupListeners"));

			iframeCommService.removeListener(directNavigationListener);
			iframeCommService.removeListener(directEventNavigationListener);
			iframeCommService.removeListener(varUpdatedListener);
		};
	}, [navigate, setExpandedProjectNavigation, projectId, getProjectsList, t]);

	const handleIframeError = useCallback(
		(event: CustomEvent) => {
			try {
				if (!retryToastDisplayed) {
					setRetryToastDisplayed(true);
					const { message } = event.detail || {};
					if (message) {
						addToast({
							message,
							type: "error",
						});
					}
				}
				LoggerService.error(
					namespaces.chatbot,
					t("debug.iframeError", { error: event.detail?.error || "Unknown iframe error" })
				);
			} catch (error) {
				LoggerService.error(namespaces.chatbot, `Failed to handle iframe error event: ${error}`);
			}
		},
		[retryToastDisplayed, addToast, t]
	);

	useEventListener(EventListenerName.iframeError, handleIframeError);

	// Memoized computed values for performance
	const frameTitle = useMemo(() => {
		return projectId && chatbotHelperConfigMode[projectId] ? t("titles.projectStatus") : t("titles.aiAssistant");
	}, [projectId, chatbotHelperConfigMode, t]);

	const frameClass = useMemo(() => {
		return cn("flex size-full flex-col items-center justify-center rounded-xl bg-gray-1100", {
			"p-6": padded,
		});
	}, [padded]);

	const titleClass = useMemo(() => {
		return cn("text-2xl font-bold text-white");
	}, []);

	const iframeStyle = useMemo(
		(): React.CSSProperties => ({
			border: "none",
			position: isLoading ? "absolute" : "relative",
			visibility: !isLoading && isIframeLoaded && !loadError ? "visible" : "hidden",
			transition: "visibility 0s, opacity 0.3s ease-in-out",
		}),
		[isLoading, isIframeLoaded, loadError]
	);

	if (descopeProjectId && !currentOrganization?.id && !isDevelopment) return null;

	return (
		<div className={frameClass}>
			<ChatbotToolbar hideCloseButton={hideCloseButton} />
			<div className={titleClass}>{frameTitle}</div>
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
					style={iframeStyle}
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
