/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useCallback, useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";

import { iframeCommService } from "@services/iframeComm.service";
import { LoggerService } from "@services/logger.service";
import { aiChatbotUrl, chatbotIframeConnectionTimeout, namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";

export const useChatbotIframeConnection = (
	iframeRef: React.RefObject<HTMLIFrameElement>,
	onConnect?: () => void,
	chatbotUrl?: string
) => {
	const { t } = useTranslation("chatbot");

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
			message: tRef.current("iframeComponent.connectionError"),
			error: tRef.current("iframeComponent.connectionErrorExtended", { error: eventErrorDetail }),
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
			baseRetryDelay: 500, // Start with 500ms for first retry
			maxRetryDelay: 2000, // Cap at 2 seconds
		} as const;

		const scheduleRetry = (reason: string, retryCount: number, errorType: string, errorDetail: string): boolean => {
			handleRetry();
			return true;
			if (retryCount < connectionConfig.maxRetries && isMounted) {
				// Exponential backoff with shorter initial delay: 500ms, 1000ms, 2000ms
				const retryDelay = Math.min(
					connectionConfig.baseRetryDelay * Math.pow(2, retryCount),
					connectionConfig.maxRetryDelay
				);

				LoggerService.debug(
					namespaces.chatbot,
					t("errors.serverRespondedWithStatus", {
						reason,
						retryDelay,
						currentAttempt: retryCount + 1,
						maxAttempts: connectionConfig.maxRetries + 1,
					})
				);

				retryTimeoutId = window.setTimeout(() => {
					if (isMounted) {
						connectAsync(retryCount + 1);
					}
				}, retryDelay);
				return true;
			}

			isConnectingRef.current = false;
			handleError(errorType, errorDetail);
			return false;
		};

		const connectAsync = async (retryCount = 0) => {
			try {
				const urlToCheck = chatbotUrl || aiChatbotUrl;
				const urlWithCacheBust = new URL(urlToCheck);
				urlWithCacheBust.searchParams.set("_cb", Date.now().toString());

				const response = await fetch(urlWithCacheBust.toString(), { method: "HEAD", credentials: "include" });
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

				if (!isMounted) return;

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
					setIsRetryLoading(false);
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
			setIsRetryLoading(false);
			setIsLoading(false);

			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			if (retryTimeoutId) {
				clearTimeout(retryTimeoutId);
			}
		};
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
				// Add retry timestamp for cache-busting (connectAsync will add _cb as well)
				url.searchParams.set("retry", Date.now().toString());
				iframeRef.current.src = url.toString();
				// State will be managed by the main connection logic
			} catch (error) {
				LoggerService.error(namespaces.chatbot, t("errors.errorSettingIframeSrc", { error }));
				// Reset loading state immediately on error
				setIsRetryLoading(false);
				setIsLoading(false);
				handleError("errors.errorSettingIframeSrc", (error as Error).message);
			}
		} else {
			LoggerService.error(namespaces.chatbot, t("errors.iframeRefIsNull"));
			// Reset loading state immediately on error
			setIsRetryLoading(false);
			setIsLoading(false);
			handleError("errors.iframeRefIsNull");
		}
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
