import { requestBlockerCooldownMs } from "@src/constants";
import { LocalStorageKeys } from "@src/enums";
import { getLocalStorageValue, setLocalStorageValue } from "@src/utilities";

export const requestBlocker = {
	get isBlocked() {
		const blockerState = getLocalStorageValue(LocalStorageKeys.requestBlockerState);
		const expiryTime = getLocalStorageValue(LocalStorageKeys.requestBlockerExpiry);

		if (expiryTime && Number(expiryTime) < Date.now()) {
			this.unblockRequests();
			return false;
		}

		return blockerState === "true";
	},

	blockRequests: () => {
		setLocalStorageValue(LocalStorageKeys.requestBlockerState, "true");

		const expiryTime = Date.now() + requestBlockerCooldownMs;
		setLocalStorageValue(LocalStorageKeys.requestBlockerExpiry, expiryTime.toString());
		unblockRequestsAfterCooldown(requestBlockerCooldownMs);
	},

	unblockRequests: () => {
		localStorage.removeItem(LocalStorageKeys.requestBlockerState);
		localStorage.removeItem(LocalStorageKeys.requestBlockerExpiry);
	},
};

export const unblockRequestsAfterCooldown = (cooldownMs = requestBlockerCooldownMs) => {
	setTimeout(() => {
		requestBlocker.unblockRequests();
	}, cooldownMs);
};

export const areRequestsBlocked = () => {
	return requestBlocker.isBlocked;
};

export const getRequestsBlockExpiry = () => {
	const expiryStr = getLocalStorageValue(LocalStorageKeys.requestBlockerExpiry);
	return expiryStr ? Number(expiryStr) : null;
};

export const getTimeUntilUnblock = () => {
	const expiry = getRequestsBlockExpiry();
	if (!expiry) return 0;

	const remaining = expiry - Date.now();
	return remaining > 0 ? remaining : 0;
};

export const unblockRequestsImmediately = () => {
	requestBlocker.unblockRequests();
};
