import { useEffect, useState } from "react";

import { triggerEvent } from "./useEventListener";
import { EventListenerName } from "@src/enums";
import { getTimeUntilUnblock } from "@src/utilities";
import { areRequestsBlocked, unblockRequestsImmediately } from "@src/utilities/requestBlockerUtils";

export const useRateLimitHandling = () => {
	const [timeLeft, setTimeLeft] = useState(getTimeUntilUnblock());

	useEffect(() => {
		const calculateTimeLeft = () => {
			const remaining = getTimeUntilUnblock();
			setTimeLeft(remaining);
			return !!remaining;
		};

		const interval = setInterval(() => {
			const timeLeft = calculateTimeLeft();
			if (!timeLeft && areRequestsBlocked()) {
				unblockRequestsImmediately();
				triggerEvent(EventListenerName.hideRateLimitModal);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return { timeLeft };
};
