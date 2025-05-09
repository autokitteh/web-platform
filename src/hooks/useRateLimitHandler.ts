import { useCallback, useEffect, useRef, useState } from "react";

import { descopeProjectId } from "@constants";
import { EventListenerName } from "@enums";
import { AuthService } from "@services";

import { triggerEvent } from "@hooks";

export const useRateLimitHandler = () => {
	const [isRetrying, setIsRetrying] = useState(false);
	const retryLoaderDelayTimeoutId = useRef<NodeJS.Timeout | null>(null);

	const onRetryClick = useCallback(async () => {
		clearRetryLoaderDelayTimeout();
		setIsRetrying(true);
		if (retryLoaderDelayTimeoutId.current) {
			clearTimeout(retryLoaderDelayTimeoutId.current);
		}
		const response = await AuthService.whoAmI();
		retryLoaderDelayTimeoutId.current = setTimeout(() => {
			if (!response.error) {
				triggerEvent(EventListenerName.hideRateLimitModal);
				window.location.reload();
				return;
			}
			setIsRetrying(false);
		}, 1200);
	}, []);

	const clearRetryLoaderDelayTimeout = () => {
		if (!retryLoaderDelayTimeoutId.current) return;

		clearTimeout(retryLoaderDelayTimeoutId.current);
		retryLoaderDelayTimeoutId.current = null;
	};

	const cleanup = () => {
		clearRetryLoaderDelayTimeout();
		triggerEvent(EventListenerName.hideRateLimitModal);
		setIsRetrying(false);
	};

	useEffect(() => {
		if (!descopeProjectId) {
			cleanup();
		}

		return () => {
			cleanup();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [descopeProjectId]);

	if (!descopeProjectId) {
		return {
			isRetrying: false,
			onRetryClick: () => {},
		};
	}

	return { isRetrying, onRetryClick };
};
