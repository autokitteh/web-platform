// Encryption configuration
export const encryptionKeyName = import.meta.env.VITE_ENCRYPTION_KEY_NAME || "autokitteh_crypto_key_v1";

// Authentication & Security Environment Variables
export const descopeProjectId: string = import.meta.env.VITE_DESCOPE_PROJECT_ID;
export const playwrightTestsAuthBearer: string = import.meta.env.TESTS_JWT_AUTH_TOKEN;
export const sentryDsn = import.meta.env.SENTRY_DSN;

// Security-related system configuration
export const systemCookies = {
	isLoggedIn: "ak_logged_in",
	templatesLandingName: "landing-template-name",
	chatStartMessage: "chat-start-message",
};
