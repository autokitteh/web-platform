import { useState, useCallback, useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";

import { iframeCommService } from "@services/iframeComm.service";
import { aiChatbotUrl, chatbotIframeConnectionTimeout } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";

export const useChatbotIframeConnection = (iframeRef: React.RefObject<HTMLIFrameElement>, onConnect?: () => void) => {
	const { t } = useTranslation("chatbot", { keyPrefix: "iframeComponent" });

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isIframeElementLoaded, setIsIframeElementLoaded] = useState<boolean>(false);

	const isLoadingRef = useRef(isLoading);
	useEffect(() => {
		isLoadingRef.current = isLoading;
	}, [isLoading]);

	const handleError = useCallback(
		(baseMessageKey: string, detail?: string) => {
			const localizedBaseMessage = t(baseMessageKey);
			setIsLoading(false);
			setLoadError(localizedBaseMessage);
			setIsIframeElementLoaded(false);

			const eventErrorDetail = detail || localizedBaseMessage;
			triggerEvent(EventListenerName.iframeError, {
				message: t("connectionError"),
				error: t("connectionErrorExtended", { error: eventErrorDetail }),
			});
		},
		[t]
	);

	const handleIframeElementLoad = useCallback(() => {
		setIsIframeElementLoaded(true);
	}, []);

	useEffect(() => {
		if (!iframeRef.current || !isIframeElementLoaded) {
			return;
		}

		setIsLoading(true);
		setLoadError(null);

		let isMounted = true;
		const currentIframe = iframeRef.current;
		let timeoutId: number | undefined = undefined;

		iframeCommService.setIframe(currentIframe);

		const connectAsync = async () => {
			try {
				const response = await fetch(aiChatbotUrl, { method: "HEAD" });
				if (!response.ok) {
					if (isMounted) {
						handleError("connectionRefused", `Server responded with status ${response.status}`);
					}
					return;
				}

				timeoutId = window.setTimeout(() => {
					if (isLoadingRef.current && isMounted) {
						handleError("connectionError", "Timeout waiting for iframe connection");
					}
				}, chatbotIframeConnectionTimeout);

				await iframeCommService.waitForConnection();

				if (timeoutId) clearTimeout(timeoutId);

				if (isMounted) {
					setIsLoading(false);
					setLoadError(null);
					onConnect?.();
				}
			} catch (error) {
				if (timeoutId) clearTimeout(timeoutId);
				if (isMounted) {
					handleError("connectionError", error instanceof Error ? error.message : String(error));
				}
			}
		};

		connectAsync();

		return () => {
			isMounted = false;
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [iframeRef, isIframeElementLoaded, onConnect, handleError, t, aiChatbotUrl, chatbotIframeConnectionTimeout]);

	const handleRetry = useCallback(() => {
		if (iframeRef.current) {
			setIsLoading(true);
			setLoadError(null);
			setIsIframeElementLoaded(false);
			iframeRef.current.src = `${aiChatbotUrl}?retry=${Date.now()}`;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [iframeRef, aiChatbotUrl]);
	return {
		isLoading,
		loadError,
		isIframeLoaded: isIframeElementLoaded,
		handleIframeElementLoad,
		handleRetry,
	};
};
