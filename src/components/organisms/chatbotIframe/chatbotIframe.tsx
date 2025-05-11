import React, { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { iframeCommService } from "@services/iframeComm.service";
import { LoggerService } from "@services/logger.service";
import { aiChatbotUrl, namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { useChatbotIframeConnection, useEventListener } from "@src/hooks";
import { ChatbotIframeProps } from "@src/interfaces/components";
import { useToastStore } from "@src/store";
import { MessageTypes } from "@src/types/iframeCommunication.type";

import { Button, Loader } from "@components/atoms";

export const ChatbotIframe = ({ title, width = "100%", height = "100%", className, onConnect }: ChatbotIframeProps) => {
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const { t } = useTranslation("chatbot", { keyPrefix: "iframeComponent" });
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const {
		state: { isLoading, loadError, isIframeLoaded },
		handleIframeError,
		handleIframeLoad,
		handleRetry,
		setupConnection,
	} = useChatbotIframeConnection(onConnect);

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

	useEffect(() => {
		let cleanup: (() => void) | undefined;

		const initConnection = async () => {
			cleanup = await setupConnection(iframeRef);
		};

		initConnection();

		return () => {
			if (cleanup) {
				cleanup();
			}
		};
	}, [setupConnection]);

	useEventListener(EventListenerName.iframeError, (event) => {
		const { message, error } = event.detail;
		addToast({
			message,
			type: "error",
		});
		LoggerService.error(namespaces.chatbot, error);
	});

	const handleError = (error: string) => {
		const { message, error: errorDetails } = handleIframeError(error);
		addToast({
			message,
			type: "error",
		});
		LoggerService.error(namespaces.chatbot, errorDetails);
	};

	const renderContent = () => {
		if (isLoading) {
			return (
				<div className="flex size-full flex-col items-center justify-center">
					<div className="flex size-24 items-center justify-center rounded-full bg-gray-1250 p-2">
						<Loader className="mr-10" size="lg" />
					</div>
					<div className="mt-16 text-gray-500">{t("loading")}</div>
				</div>
			);
		}

		if (loadError) {
			return (
				<div className="flex size-full flex-col items-center justify-center">
					<div className="mb-4 text-error">{t("loadingError")}</div>
					<Button
						ariaLabel={t("ariaLabelRetry")}
						className="border-white px-4 py-2 font-semibold text-white hover:bg-black"
						onClick={() => handleRetry(iframeRef)}
						variant="outline"
					>
						{t("retry")}
					</Button>
				</div>
			);
		}

		return null;
	};

	return (
		<div className="flex size-full flex-col items-center justify-center">
			{renderContent()}
			{!loadError ? (
				<iframe
					className={className}
					height={height}
					onError={(event) => handleError(event.toString())}
					onLoad={handleIframeLoad}
					ref={iframeRef}
					src={aiChatbotUrl}
					style={{
						border: "none",
						position: isLoading ? "absolute" : "relative",
						visibility: isLoading ? "hidden" : "visible",
						opacity: isIframeLoaded ? 1 : 0,
						transition: "opacity 0.3s ease-in-out",
					}}
					title={title}
					width={width}
				/>
			) : null}
		</div>
	);
};

export default ChatbotIframe;
