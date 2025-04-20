import { useEffect, useRef, useState } from "react";

import { descopeProjectId, requestBlockerCooldownMs } from "@constants";
import { EventListenerName } from "@enums";
import { AuthService } from "@services";
import { getTimeUntilUnblock, areRequestsBlocked, unblockRequestsImmediately } from "@utilities";

import { triggerEvent, useInterval } from "@hooks";

export const useRateLimitHandler = () => {
	const [timeLeft, setTimeLeft] = useState(getTimeUntilUnblock());
	const [secondsLeft, setSecondsLeft] = useState(
		Math.floor((getTimeUntilUnblock() % requestBlockerCooldownMs) / 1000)
	);
	const { startInterval, stopInterval } = useInterval();
	const [isRetrying, setIsRetrying] = useState(false);
	const intervalRef = useRef<number | null>(null);
	const retryLoaderDelayTimeoutId = useRef<NodeJS.Timeout | null>(null);

	const onRetryClick = async () => {
		setIsRetrying(true);
		const response = await AuthService.whoAmI();
		retryLoaderDelayTimeoutId.current = setTimeout(() => {
			if (!response.error) {
				triggerEvent(EventListenerName.hideRateLimitModal);
			}
			setIsRetrying(false);
		}, 1200);
	};

	const cleanup = () => {
		if (retryLoaderDelayTimeoutId.current) {
			clearTimeout(retryLoaderDelayTimeoutId.current);
			retryLoaderDelayTimeoutId.current = null;
		}

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		triggerEvent(EventListenerName.hideRateLimitModal);
		setIsRetrying(false);
		unblockRequestsImmediately();
		stopInterval("rateLimitHandler");
	};

	useEffect(() => {
		if (!descopeProjectId) return;
		startInterval(
			"rateLimitHandler",
			() => {
				const remaining = getTimeUntilUnblock();
				setTimeLeft(remaining);
				setSecondsLeft(Math.floor((remaining % requestBlockerCooldownMs) / 1000));

				if (!remaining && areRequestsBlocked()) {
					cleanup();
				}
			},
			1000
		);

		return () => {
			cleanup();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!descopeProjectId) {
		cleanup();
		return {
			isRetrying: false,
			timeLeft: 0,
			secondsLeft: 0,
			onRetryClick: () => {},
		};
	}

	return { isRetrying, timeLeft, secondsLeft, onRetryClick };
};
