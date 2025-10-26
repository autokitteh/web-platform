/* eslint-disable no-console */
import { t } from "i18next";

import { Organization } from "@src/types/models";

/**
 * Higher-order function that wraps Clarity API calls with error handling and availability checks.
 * Ensures graceful degradation when Clarity is not available or configured.
 *
 * @template T - Array of function argument types
 * @template R - Return type of the wrapped function
 * @param fn - The async function to wrap with Clarity availability checks
 * @param operationName - Name of the operation for error logging
 * @returns Wrapped function that safely executes Clarity operations
 */
const withClarityCheck = <T extends any[], R>(
	fn: (...args: T) => Promise<R>,
	operationName: string
): ((...args: T) => Promise<R | void>) => {
	return async (...args: T): Promise<R | void> => {
		if (!window.clarity) {
			return;
		}

		try {
			return await fn(...args);
		} catch (error) {
			console.warn(`Clarity ${operationName} failed:`, error);
		}
	};
};

/**
 * Microsoft Clarity integration utilities for session recording and analytics.
 * Provides a type-safe wrapper around the Clarity JavaScript API with error handling.
 *
 * All methods are wrapped with availability checks and will fail gracefully if Clarity is not loaded.
 * Used for tracking user sessions, page views, and custom events in the Microsoft Clarity dashboard.
 */
export const ClarityUtils = {
	/**
	 * Initializes Microsoft Clarity configuration.
	 * Verifies that Clarity is loaded and configures it for Single Page Application (SPA) usage.
	 * Note: The Clarity script should be loaded via the HTML head tag before calling this.
	 *
	 * @returns true if Clarity is available and configured, false otherwise
	 */
	init: (): boolean => {
		if (!window.clarity) {
			const message =
				t("clarity.noConfig", {
					ns: "utilities",
				}) || "Microsoft Clarity is not configured. Analytics tracking is disabled.";
			console.warn(message);
			return false;
		}

		try {
			// Configure Clarity for SPA - this is already done in index.html
			// but we can verify it here
			return true;
		} catch (error) {
			console.error("Failed to initialize Clarity:", error);
			return false;
		}
	},

	/**
	 * Sets user identification in Clarity when user logs in.
	 * Creates a new user session with the provided credentials.
	 *
	 * @param userId - Unique user identifier
	 * @param userName - Display name of the user
	 * @param userEmail - User's email address
	 */
	setUserOnLogin: withClarityCheck(async (userId: string, userName: string, userEmail: string): Promise<void> => {
		window.clarity!("identify", userId, "", "onLogin", `${userEmail}`);
		window.clarity!("set", "userName", userName);
	}, "setUserOnLogin"),

	/**
	 * Updates user context and tracks page navigation in Clarity.
	 * Called on route changes to maintain user session context across pages.
	 *
	 * @param pageProps - Page and user information for tracking
	 * @param pageProps.pageTitleKey - Translation key for the page title
	 * @param pageProps.userEmail - User's email address
	 * @param pageProps.userId - Unique user identifier
	 * @param pageProps.userName - Display name of the user
	 */
	setPageId: withClarityCheck(
		async (pageProps: {
			pageTitleKey: string;
			userEmail: string;
			userId: string;
			userName: string;
		}): Promise<void> => {
			const { userId, userName, userEmail, pageTitleKey } = pageProps;
			window.clarity!("identify", userId, "", pageTitleKey, `${userEmail}`);
			window.clarity!("set", "userName", userName);
		},
		"setPageId"
	),

	/**
	 * Sets the current organization context in Clarity.
	 * Tracks which organization the user is currently viewing/interacting with.
	 *
	 * @param orgInfo - Organization information object
	 */
	setOrg: withClarityCheck(async (orgInfo: Organization): Promise<void> => {
		window.clarity!("set", "org", orgInfo.id);
	}, "setOrg"),

	/**
	 * Sets the current project context in Clarity.
	 * Tracks which project the user is currently viewing/editing.
	 *
	 * @param projectId - Unique project identifier
	 * @param projectName - Display name of the project
	 */
	setProject: withClarityCheck(async (projectId: string, projectName: string): Promise<void> => {
		window.clarity!("set", "projectId", projectId);
		window.clarity!("set", "projectName", projectName);
	}, "setProject"),

	/**
	 * Sets the user's role for analytics segmentation.
	 * Useful for understanding behavior differences across user roles.
	 *
	 * @param role - User role (e.g., "admin", "member", "viewer")
	 */
	setUserRole: withClarityCheck(async (role: string): Promise<void> => {
		window.clarity!("set", "userRole", role);
	}, "setUserRole"),

	/**
	 * Sets the user's subscription plan type.
	 * Used for analyzing feature usage across different plan tiers.
	 *
	 * @param planType - Plan type (e.g., "free", "pro", "enterprise")
	 */
	setPlanType: withClarityCheck(async (planType: string): Promise<void> => {
		window.clarity!("set", "planType", planType);
	}, "setPlanType"),

	/**
	 * Sets the current deployment context in Clarity.
	 * Tracks which deployment the user is viewing or interacting with.
	 *
	 * @param deploymentId - Unique deployment identifier
	 */
	setDeploymentId: withClarityCheck(async (deploymentId: string): Promise<void> => {
		window.clarity!("set", "deploymentId", deploymentId);
	}, "setDeploymentId"),

	/**
	 * Tracks a custom event in Clarity.
	 * Used for recording specific user actions or application events.
	 *
	 * @param eventName - Name of the event to track
	 * @param properties - Optional event properties/metadata
	 */
	trackEvent: withClarityCheck(async (eventName: string, properties?: Record<string, any>): Promise<void> => {
		window.clarity!("event", eventName, properties);
	}, "trackEvent"),

	/**
	 * Sets the current session context in Clarity.
	 * Links Clarity sessions with application session identifiers.
	 *
	 * @param sessionId - Application session identifier
	 */
	setSessionId: withClarityCheck(async (sessionId: string): Promise<void> => {
		window.clarity!("set", "sessionId", sessionId);
	}, "setSessionId"),

	/**
	 * Sets the current event context in Clarity.
	 * Used when viewing or debugging specific events in the application.
	 *
	 * @param eventId - Unique event identifier
	 */
	setEventId: withClarityCheck(async (eventId: string): Promise<void> => {
		window.clarity!("set", "eventId", eventId);
	}, "setEventId"),
};
