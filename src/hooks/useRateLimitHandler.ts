import { useEffect, useRef, useState } from "react";

import { descopeProjectId } from "@constants";
import { EventListenerName } from "@enums";
import { AuthService } from "@services";

import { triggerEvent } from "@hooks";

export const useRateLimitHandler = () => {
	const [isRetrying, setIsRetrying] = useState(false);
	const retryLoaderDelayTimeoutId = useRef<NodeJS.Timeout | null>(null);

	const onRetryClick = async () => {
		setIsRetrying(true);
		const response = await AuthService.whoAmI();
		retryLoaderDelayTimeoutId.current = setTimeout(() => {
			if (!response.error) {
				triggerEvent(EventListenerName.hideRateLimitModal);
				setIsRetrying(false);
				window.location.reload();
			}
			setIsRetrying(false);
		}, 1200);
	};

	const cleanup = () => {
		if (retryLoaderDelayTimeoutId.current) {
			clearTimeout(retryLoaderDelayTimeoutId.current);
			retryLoaderDelayTimeoutId.current = null;
		}

		triggerEvent(EventListenerName.hideRateLimitModal);
		setIsRetrying(false);
	};

	useEffect(() => {
		return () => {
			cleanup();
		};
	}, []);

	if (!descopeProjectId) {
		cleanup();
		return {
			isRetrying: false,
			onRetryClick: () => {},
		};
	}

	return { isRetrying, onRetryClick };
};
