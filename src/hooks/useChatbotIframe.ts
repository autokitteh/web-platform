/* eslint-disable no-console */
import { useState, useCallback, useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";

import { iframeCommService } from "@services/iframeComm.service";
import { LoggerService } from "@services/logger.service";
import { aiChatbotUrl, chatbotIframeConnectionTimeout, namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";

export const useChatbotIframeConnection = (iframeRef: React.RefObject<HTMLIFrameElement>, onConnect?: () => void) => {
	const { t } = useTranslation("chatbot", { keyPrefix: "iframeComponent" });

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isIframeElementLoaded, setIsIframeElementLoaded] = useState<boolean>(false);
	const [isRetryLoading, setIsRetryLoading] = useState<boolean>(false);

	const isLoadingRef = useRef(isLoading);
	const tRef = useRef(t);
	const onConnectRef = useRef(onConnect);
	const isConnectingRef = useRef(false);

	useEffect(() => {
		isLoadingRef.current = isLoading;
	}, [isLoading]);

	useEffect(() => {
		tRef.current = t;
	}, [t]);

	useEffect(() => {
		onConnectRef.current = onConnect;
	}, [onConnect]);

	const handleError = useCallback((baseMessageKey: string, detail?: string) => {
		const localizedBaseMessage = tRef.current(baseMessageKey);
		setIsLoading(false);
		setLoadError(localizedBaseMessage);
		setIsIframeElementLoaded(false);
		setTimeout(() => {
			setIsRetryLoading(false);
		}, 1750);

		const eventErrorDetail = detail || localizedBaseMessage;
		triggerEvent(EventListenerName.iframeError, {
			message: tRef.current("connectionError"),
			error: tRef.current("connectionErrorExtended", { error: eventErrorDetail }),
		});
	}, []);

	const handleIframeElementLoad = useCallback(() => {
		setIsIframeElementLoaded(true);
	}, []);

	useEffect(() => {
		if (!iframeRef.current || !isIframeElementLoaded || isConnectingRef.current) {
			return;
		}

		setIsLoading(true);
		setLoadError(null);
		isConnectingRef.current = true;

		let isMounted = true;
		const currentIframe = iframeRef.current;
		let timeoutId: number | undefined = undefined;
		let retryTimeoutId: number | undefined = undefined;

		iframeCommService.setIframe(currentIframe);

		const connectionConfig = {
			maxRetries: 3,
			retryDelay: 2000,
		} as const;

		const scheduleRetry = (reason: string, retryCount: number, errorType: string, errorDetail: string): boolean => {
			if (retryCount < connectionConfig.maxRetries && isMounted) {
				console.warn(
					`[Chatbot] ${reason}, retrying in ${connectionConfig.retryDelay}ms (attempt ${retryCount + 1}/${connectionConfig.maxRetries + 1})`
				);
				retryTimeoutId = window.setTimeout(() => {
					if (isMounted) {
						connectAsync(retryCount + 1);
					}
				}, connectionConfig.retryDelay);
				return true;
			}

			isConnectingRef.current = false;
			handleError(errorType, errorDetail);
			return false;
		};

		const connectAsync = async (retryCount = 0) => {
			try {
				const response = await fetch(aiChatbotUrl, { method: "HEAD", credentials: "include" });
				if (!response.ok) {
					if (isMounted) {
						scheduleRetry(
							`Server responded with status ${response.status}`,
							retryCount,
							"connectionRefused",
							`Server responded with status ${response.status}`
						);
					}
					return;
				}

				timeoutId = window.setTimeout(() => {
					if (isLoadingRef.current && isMounted) {
						if (timeoutId) clearTimeout(timeoutId);
						scheduleRetry(
							"Connection timeout",
							retryCount,
							"connectionError",
							"Timeout waiting for iframe connection"
						);
					}
				}, chatbotIframeConnectionTimeout);

				await iframeCommService.waitForConnection();

				if (timeoutId) clearTimeout(timeoutId);

				if (isMounted) {
					setIsLoading(false);
					setLoadError(null);
					setTimeout(() => {
						setIsRetryLoading(false);
					}, 1750);
					onConnectRef.current?.();
					isConnectingRef.current = false;
				}
			} catch (error) {
				if (timeoutId) clearTimeout(timeoutId);
				if (isMounted) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					scheduleRetry(`Connection error: ${errorMessage}`, retryCount, "connectionError", errorMessage);
				}
			}
		};

		connectAsync();

		return () => {
			isMounted = false;
			isConnectingRef.current = false;
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			if (retryTimeoutId) {
				clearTimeout(retryTimeoutId);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [iframeRef, isIframeElementLoaded]);

	const handleRetry = useCallback(() => {
		if (iframeRef.current) {
			setIsRetryLoading(true);
			setLoadError(null);
			setIsIframeElementLoaded(false);
			isConnectingRef.current = false;

			const currentSrc = iframeRef.current.src;
			const urlToUse = currentSrc || aiChatbotUrl;

			try {
				const url = new URL(urlToUse);
				url.searchParams.set("retry", Date.now().toString());
				iframeRef.current.src = url.toString();
			} catch (error) {
				LoggerService.error(namespaces.chatbot, `Error setting iframe src: ${error}`);
			}

			setTimeout(() => {
				setIsRetryLoading(false);
			}, 1750);
		} else {
			LoggerService.error(namespaces.chatbot, "iframeRef.current is null, cannot retry");
			setTimeout(() => {
				setIsRetryLoading(false);
			}, 1750);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [iframeRef, aiChatbotUrl]);
	return {
		isLoading,
		loadError,
		isIframeLoaded: isIframeElementLoaded,
		handleIframeElementLoad,
		handleRetry,
		isRetryLoading,
	};
};
