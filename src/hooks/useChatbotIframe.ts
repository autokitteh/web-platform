import { useState } from "react";

import { useTranslation } from "react-i18next";

import { iframeCommService } from "@services/iframeComm.service";
import { aiChatbotUrl, chatbotIframeConnectionTimeout } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { IframeError, IframeState } from "@src/interfaces/hooks";

export const useChatbotIframeConnection = (onConnect?: () => void) => {
	const [state, setState] = useState<IframeState>({
		isLoading: true,
		loadError: null,
		isIframeLoaded: false,
	});
	const { t } = useTranslation("chatbot", { keyPrefix: "iframeComponent" });

	const handleIframeError = (error: string): IframeError => {
		setState((prev) => ({ ...prev, isLoading: false, loadError: t("unavailable") }));
		return {
			message: t("connectionError"),
			error: t("connectionErrorExtended", { error }),
		};
	};

	const handleIframeLoad = () => {
		setState((prev) => ({ ...prev, isIframeLoaded: true, isLoading: false }));
	};

	const handleRetry = (iframeRef: React.RefObject<HTMLIFrameElement>) => {
		setState({ isLoading: true, loadError: null, isIframeLoaded: false });
		if (iframeRef.current) {
			iframeRef.current.src = aiChatbotUrl;
		}
	};

	const checkConnection = async (): Promise<boolean> => {
		try {
			const response = await fetch(aiChatbotUrl, { method: "HEAD" });
			return response.ok;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (_error) {
			return false;
		}
	};

	const setupConnection = async (iframeRef: React.RefObject<HTMLIFrameElement>) => {
		if (iframeRef.current) {
			const isAvailable = await checkConnection();
			if (!isAvailable) {
				const errorInfo = handleIframeError(t("connectionRefused"));
				triggerEvent(EventListenerName.iframeError, errorInfo);
				return;
			}

			iframeCommService.setIframe(iframeRef.current);

			const timeoutId = setTimeout(() => {
				if (state.isLoading) {
					const errorInfo = handleIframeError(t("connectionError"));
					triggerEvent(EventListenerName.iframeError, errorInfo);
				}
			}, chatbotIframeConnectionTimeout);

			iframeCommService
				.waitForConnection()
				.then(() => {
					clearTimeout(timeoutId);
					setState((prev) => ({ ...prev, loadError: null }));
					if (onConnect) {
						onConnect();
					}
					return true;
				})
				.catch((error) => {
					clearTimeout(timeoutId);
					const errorInfo = handleIframeError(error);
					triggerEvent(EventListenerName.iframeError, errorInfo);
				});

			return () => {
				clearTimeout(timeoutId);
				iframeCommService.destroy();
			};
		}
	};

	return {
		state,
		handleIframeError,
		handleIframeLoad,
		handleRetry,
		setupConnection,
	};
};
