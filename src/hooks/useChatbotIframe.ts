/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */

import { useState, useCallback, useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";

import { iframeCommService } from "@services/iframeComm.service";
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

		if (iframeCommService.isConnectedToIframe) {
			setIsLoading(false);
			setLoadError(null);
			onConnectRef.current?.();
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
			maxRetries: 10,
			baseRetryDelay: 200,
			maxRetryDelay: 3000,
		} as const;

		const scheduleRetry = (reason: string, retryCount: number, errorType: string, errorDetail: string): boolean => {
			if (retryCount < connectionConfig.maxRetries && isMounted) {
				const retryDelay = Math.min(
					connectionConfig.baseRetryDelay * Math.pow(2, retryCount),
					connectionConfig.maxRetryDelay
				);

				console.debug(
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
						autoRetryConnection(retryCount);
					}
				}, retryDelay);
				return true;
			}

			isConnectingRef.current = false;
			handleError(errorType, errorDetail);
			return false;
		};

		const checkIframeReadiness = async (iframe: HTMLIFrameElement): Promise<boolean> => {
			return new Promise((resolve) => {
				let attempts = 0;
				const maxAttempts = 10;
				const checkInterval = 100;

				const checkReady = () => {
					attempts++;
					try {
						if (iframe.contentWindow && iframe.contentDocument?.readyState === "complete") {
							resolve(true);
							return;
						}
					} catch (error) {
						// Cross-origin access may be blocked, but iframe might still be ready
						console.debug(
							namespaces.chatbot,
							tRef.current(
								"Cross-origin access may be blocked, but iframe might still be ready: {{error}}",
								{ error }
							)
						);
					}

					if (attempts >= maxAttempts) {
						resolve(true);
						return;
					}

					setTimeout(checkReady, checkInterval);
				};

				checkReady();
			});
		};

		const connectAsync = async (retryCount = 0) => {
			try {
				const urlToCheck = chatbotUrl || aiChatbotUrl;
				const urlWithCacheBust = new URL(urlToCheck);
				urlWithCacheBust.searchParams.set("_cb", Date.now().toString());

				console.debug(
					namespaces.chatbot,
					t("debug.attemptingConnection", {
						attempt: retryCount + 1,
						url: urlWithCacheBust.toString(),
					})
				);

				const response = await fetch(urlWithCacheBust.toString(), { method: "HEAD", credentials: "include" });
				if (!response.ok) {
					if (isMounted) {
						handleError("connectionRefused", `Server responded with status ${response.status}`);
					}
					return;
				}

				if (!isMounted) return;

				// Wait for iframe to be ready before attempting handshake
				await checkIframeReadiness(currentIframe);

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

				await iframeCommService.waitForAnyMessage();

				if (timeoutId) clearTimeout(timeoutId);

				if (isMounted) {
					console.debug(
						namespaces.chatbot,
						t("debug.connectionSuccessful", {
							attempt: retryCount + 1,
							totalTime: Date.now() - parseInt(urlWithCacheBust.searchParams.get("_cb") || "0"),
						})
					);
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
					handleError("connectionError", errorMessage);
				}
			}
		};

		const autoRetryConnection = (currentRetryCount: number) => {
			if (!iframeRef.current || !isMounted) return;

			isConnectingRef.current = false;

			console.debug(
				namespaces.chatbot,
				t("debug.retryingConnectionWithoutReload", { retryCount: currentRetryCount + 1 })
			);

			connectAsync(currentRetryCount + 1);
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
	}, [iframeRef, isIframeElementLoaded, chatbotUrl]);

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
				console.error(namespaces.chatbot, t("errors.errorSettingIframeSrc", { error }));
				setIsRetryLoading(false);
				setIsLoading(false);
				handleError("errors.errorSettingIframeSrc", (error as Error).message);
			}
		} else {
			console.error(namespaces.chatbot, t("errors.iframeRefIsNull"));
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
