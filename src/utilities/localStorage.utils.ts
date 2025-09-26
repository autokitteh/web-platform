import { LocalStorageKeys } from "@src/enums";

// Simple encoding for sensitive data (not cryptographic security, but prevents casual inspection)
const encodeValue = (value: string): string => {
	try {
		return btoa(value);
	} catch {
		return value;
	}
};

const decodeValue = (value: string): string => {
	try {
		return atob(value);
	} catch {
		return value;
	}
};

export const getPreference = (key: LocalStorageKeys): boolean => {
	const savedPreference = localStorage.getItem(key);

	return savedPreference === null ? true : savedPreference === "true";
};

export const setPreference = (key: LocalStorageKeys, value: boolean): void => {
	localStorage.setItem(key, value.toString());
};

export const getLocalStorageValue = (key: LocalStorageKeys): string | null => {
	const value = localStorage.getItem(key);
	if (!value) return null;

	// Decode sensitive values
	if (key === LocalStorageKeys.apiToken) {
		return decodeValue(value);
	}

	return value;
};

export const setLocalStorageValue = (key: LocalStorageKeys, value: string): void => {
	// Encode sensitive values
	if (key === LocalStorageKeys.apiToken && value) {
		localStorage.setItem(key, encodeValue(value));
	} else {
		localStorage.setItem(key, value);
	}
};
