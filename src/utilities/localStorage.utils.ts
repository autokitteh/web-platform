import { LocalStorageKeys } from "@src/enums";

export const getPreference = (key: LocalStorageKeys): boolean => {
	const savedPreference = localStorage.getItem(key);

	return savedPreference === null ? true : savedPreference === "true";
};

export const setPreference = (key: LocalStorageKeys, value: boolean): void => {
	localStorage.setItem(key, value.toString());
};

export const getLocalStorageValue = (key: LocalStorageKeys): string | null => {
	return localStorage.getItem(key);
};

export const setLocalStorageValue = (key: LocalStorageKeys, value: string): void => {
	localStorage.setItem(key, value);
};
