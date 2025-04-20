import { useEffect, useRef, useState } from "react";

import { descopeProjectId, requestBlockerCooldownMs } from "@constants";
import { EventListenerName } from "@enums";
import { getTimeUntilUnblock, areRequestsBlocked, unblockRequestsImmediately } from "@utilities";

import { triggerEvent } from "@hooks";
import { useOrganizationStore } from "@store";

export const useRateLimitHandler = () => {
	const [timeLeft, setTimeLeft] = useState(getTimeUntilUnblock());
	const [secondsLeft, setSecondsLeft] = useState(
		Math.floor((getTimeUntilUnblock() % requestBlockerCooldownMs) / 1000)
	);
	const [isRetrying, setIsRetrying] = useState(false);
	const intervalRef = useRef<number | null>(null);

	let retryLoaderDelayTimeoutId: NodeJS.Timeout | null = null;
	const onRetryClick = async () => {
		setIsRetrying(true);
		const response = await useOrganizationStore.getState().refreshCookie(true);
		retryLoaderDelayTimeoutId = setTimeout(() => {
			if (!response.error) {
				triggerEvent(EventListenerName.hideRateLimitModal);
			}
			setIsRetrying(false);
		}, 1200);
	};

	const cleanup = () => {
		if (retryLoaderDelayTimeoutId) {
			clearTimeout(retryLoaderDelayTimeoutId);
		}

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		triggerEvent(EventListenerName.hideRateLimitModal);
		setIsRetrying(false);
		unblockRequestsImmediately();
	};

	useEffect(() => {
		if (!descopeProjectId) return;
		intervalRef.current = window.setInterval(() => {
			const remaining = getTimeUntilUnblock();
			setTimeLeft(remaining);
			setSecondsLeft(Math.floor((remaining % requestBlockerCooldownMs) / 1000));

			if (!remaining && areRequestsBlocked()) {
				cleanup();
			}
		}, 1000);

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
