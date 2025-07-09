import { useState, useCallback, useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";

import { iframeCommService } from "@services/iframeComm.service";
import { aiChatbotUrl, chatbotIframeConnectionTimeout } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";

export const useChatbotIframeConnection = (
	iframeRef: React.RefObject<HTMLIFrameElement>,
	onConnect?: () => void,
	chatbotUrl?: string
) => {
	const { t } = useTranslation("chatbot", { keyPrefix: "iframeComponent" });

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isIframeElementLoaded, setIsIframeElementLoaded] = useState<boolean>(false);
	const [isRetryLoading, setIsRetryLoading] = useState<boolean>(false);

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
			setIsRetryLoading(false);

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
		console.log("Connection effect triggered", {
			hasIframe: !!iframeRef.current,
			isIframeElementLoaded,
		});

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
				const response = await fetch(aiChatbotUrl, { method: "HEAD", credentials: "include" });
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
					console.log("Connection successful, clearing isRetryLoading");
					setIsLoading(false);
					setLoadError(null);
					setIsRetryLoading(false);
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
		console.log("handleRetry called");
		console.log("iframeRef.current:", iframeRef.current);
		console.log("chatbotUrl param:", chatbotUrl);

		if (iframeRef.current) {
			console.log("Setting isRetryLoading to true");
			setIsRetryLoading(true);
			setLoadError(null);
			setIsIframeElementLoaded(false);

			// Use the provided chatbotUrl with params or fallback to base aiChatbotUrl
			const urlToUse = chatbotUrl || aiChatbotUrl;
			console.log("Using URL for retry:", urlToUse);

			try {
				// Properly handle URL with existing query parameters
				const url = new URL(urlToUse);
				url.searchParams.set("retry", Date.now().toString());
				console.log("Final retry URL:", url.toString());
				iframeRef.current.src = url.toString();
				console.log("Iframe src set successfully");
			} catch (error) {
				console.error("Error setting iframe src:", error);
			}

			// Ensure loader is shown for at least 1.5 seconds
			setTimeout(() => {
				console.log("Clearing isRetryLoading after timeout");
				setIsRetryLoading(false);
			}, 1800);
		} else {
			console.log("iframeRef.current is null, cannot retry");
		}
	}, [iframeRef, chatbotUrl]);
	return {
		isLoading,
		loadError,
		isIframeLoaded: isIframeElementLoaded,
		handleIframeElementLoad,
		handleRetry,
		isRetryLoading,
	};
};
