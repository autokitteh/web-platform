import { encryptedStorageKeys, encryptionKeyName } from "@constants/security.constants";
import { LocalStorageKeys } from "@src/enums";

/**
 * Generates or retrieves the encryption key for secure localStorage operations
 */
const getEncryptionKey = async (): Promise<CryptoKey> => {
	const keyData = localStorage.getItem(encryptionKeyName);

	if (keyData) {
		try {
			const keyBuffer = new Uint8Array(JSON.parse(keyData));
			return await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
		} catch {
			// Fall through to generate new key
		}
	}

	const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);

	const exportedKey = await crypto.subtle.exportKey("raw", key);
	localStorage.setItem(encryptionKeyName, JSON.stringify(Array.from(new Uint8Array(exportedKey))));

	return key;
};

/**
 * Encrypts a string value using AES-GCM encryption
 * IV is combined with encrypted data for secure storage
 */
const encryptValue = async (value: string): Promise<string> => {
	try {
		const key = await getEncryptionKey();
		const encoder = new TextEncoder();
		const data = encoder.encode(value);

		// Generate random IV (12 bytes for AES-GCM)
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

		// Combine IV and encrypted data (IV is needed for decryption)
		const result = new Uint8Array(iv.length + encrypted.byteLength);
		result.set(iv);
		result.set(new Uint8Array(encrypted), iv.length);

		return JSON.stringify(Array.from(result));
	} catch {
		// Fallback to base64 if encryption fails
		return btoa(value);
	}
};

/**
 * Decrypts a string value using AES-GCM decryption
 * Extracts IV from the beginning of the encrypted data
 */
const decryptValue = async (encryptedValue: string): Promise<string> => {
	try {
		const key = await getEncryptionKey();
		const data = new Uint8Array(JSON.parse(encryptedValue));

		// Extract IV (first 12 bytes) and encrypted data
		const iv = data.slice(0, 12);
		const encrypted = data.slice(12);

		const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);

		const decoder = new TextDecoder();
		return decoder.decode(decrypted);
	} catch {
		// Fallback to base64 decode if decryption fails
		try {
			return atob(encryptedValue);
		} catch {
			return encryptedValue;
		}
	}
};

/**
 * Checks if a given localStorage key should be encrypted
 */
const shouldEncrypt = (key: LocalStorageKeys): boolean => {
	return encryptedStorageKeys.has(key);
};

export const getPreference = (key: LocalStorageKeys): boolean => {
	const savedPreference = localStorage.getItem(key);
	return savedPreference === null ? true : savedPreference === "true";
};

export const setPreference = (key: LocalStorageKeys, value: boolean): void => {
	localStorage.setItem(key, value.toString());
};

/**
 * Retrieves a value from localStorage with optional encryption support
 * @param key - The localStorage key
 * @param isEncrypted - Explicitly specify if the value should be decrypted (optional)
 */
export const getLocalStorageValue = async (key: LocalStorageKeys, isEncrypted?: boolean): Promise<string | null> => {
	const value = localStorage.getItem(key);
	if (!value) return null;

	// Determine if decryption is needed
	const needsDecryption = isEncrypted !== undefined ? isEncrypted : shouldEncrypt(key);

	if (needsDecryption) {
		return await decryptValue(value);
	}

	return value;
};

/**
 * Stores a value in localStorage with optional encryption support
 * @param key - The localStorage key
 * @param value - The value to store
 * @param isEncrypted - Explicitly specify if the value should be encrypted (optional)
 */
export const setLocalStorageValue = async (
	key: LocalStorageKeys,
	value: string,
	isEncrypted?: boolean
): Promise<void> => {
	// Determine if encryption is needed
	const needsEncryption = isEncrypted !== undefined ? isEncrypted : shouldEncrypt(key);

	if (needsEncryption && value) {
		const encrypted = await encryptValue(value);
		localStorage.setItem(key, encrypted);
	} else if (needsEncryption && !value) {
		// Don't store empty sensitive values
		localStorage.removeItem(key);
	} else {
		localStorage.setItem(key, value);
	}
};

// Synchronous versions for backward compatibility where encryption isn't needed
export const getLocalStorageValueSync = (key: LocalStorageKeys): string | null => {
	if (shouldEncrypt(key)) {
		// eslint-disable-next-line no-console
		console.warn(`Key "${key}" requires encryption. Use getLocalStorageValue instead.`);
		return null;
	}
	return localStorage.getItem(key);
};

export const setLocalStorageValueSync = (key: LocalStorageKeys, value: string): void => {
	if (shouldEncrypt(key)) {
		// eslint-disable-next-line no-console
		console.warn(`Key "${key}" requires encryption. Use setLocalStorageValue instead.`);
		return;
	}
	localStorage.setItem(key, value);
};
