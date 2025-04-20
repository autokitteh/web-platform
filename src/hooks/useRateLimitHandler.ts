import { useEffect, useRef, useState } from "react";

import { descopeProjectId } from "@constants";
import { EventListenerName } from "@enums";
import { getTimeUntilUnblock, areRequestsBlocked, unblockRequestsImmediately } from "@utilities";

import { triggerEvent } from "@hooks";
import { useOrganizationStore } from "@store";

export const useRateLimitHandler = () => {
	const [timeLeft, setTimeLeft] = useState(getTimeUntilUnblock());
	const [isRetrying, setIsRetrying] = useState(false);
	const intervalRef = useRef<number | null>(null);

	let timeoutId: NodeJS.Timeout | null = null;
	const onRetryClick = async () => {
		setIsRetrying(true);
		const response = await useOrganizationStore.getState().refreshCookie(true);
		timeoutId = setTimeout(() => {
			if (!response.error) {
				triggerEvent(EventListenerName.hideRateLimitModal);
			}
			setIsRetrying(false);
		}, 1200);
	};

	const cleanup = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
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
		const calculateTimeLeft = () => {
			const remaining = getTimeUntilUnblock();
			setTimeLeft(remaining);
			return !!remaining;
		};

		// Store interval ID in the ref
		intervalRef.current = window.setInterval(() => {
			const timeLeft = calculateTimeLeft();
			if (!timeLeft && areRequestsBlocked()) {
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
			onRetryClick: () => {},
		};
	}

	return { isRetrying, timeLeft, onRetryClick };
};
