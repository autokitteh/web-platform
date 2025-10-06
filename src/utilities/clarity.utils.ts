/* eslint-disable no-console */
import { t } from "i18next";

const withClarityCheck = <T extends any[], R>(
	fn: (...args: T) => Promise<R>,
	operationName: string
): ((...args: T) => Promise<R | void>) => {
	return async (...args: T): Promise<R | void> => {
		if (!window.clarity) {
			const message =
				t("clarity.noConfig", {
					ns: "utilities",
				}) || "Microsoft Clarity is not configured. Analytics tracking is disabled.";
			console.warn(message);
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
 * Identifies user on login
 * @param userId - User ID
 * @param userName - User name
 * @param userEmail - User email
 */
export const setClarityUserOnLogin = withClarityCheck(
	async (userId: string, userName: string, userEmail: string): Promise<void> => {
		window.clarity!("identify", userId, "", "onLogin", `${userEmail}`);
		window.clarity!("set", "userName", userName);
	},
	"setUserOnLogin"
);

/**
 * Sets page identification with detailed context
 * @param pageProps - Page properties for identification
 */
export const setClarityPageId = withClarityCheck(
	async (pageProps: { pageTitleKey: string; userEmail: string; userId: string; userName: string }): Promise<void> => {
		const { userId, userName, userEmail, pageTitleKey } = pageProps;
		window.clarity!("identify", userId, "", pageTitleKey, `${userEmail}`);
		window.clarity!("set", "userName", userName);
	},
	"setPageId"
);

/**
 * Sets organization context
 * @param orgId - Organization ID
 */
export const setClarityOrg = withClarityCheck(async (orgId: string): Promise<void> => {
	window.clarity!("set", "org", orgId);
}, "setOrg");

/**
 * Sets project context
 * @param projectId - Project ID
 * @param projectName - Project name
 */
export const setClarityProject = withClarityCheck(async (projectId: string, projectName: string): Promise<void> => {
	window.clarity!("set", "projectId", projectId);
	window.clarity!("set", "projectName", projectName);
}, "setProject");

/**
 * Sets user role
 * @param role - User role
 */
export const setClarityUserRole = withClarityCheck(async (role: string): Promise<void> => {
	window.clarity!("set", "userRole", role);
}, "setUserRole");

/**
 * Sets plan type
 * @param planType - Plan type
 */
export const setClarityPlanType = withClarityCheck(async (planType: string): Promise<void> => {
	window.clarity!("set", "planType", planType);
}, "setPlanType");

/**
 * Sets deployment ID
 * @param deploymentId - Deployment ID
 */
export const setClarityDeploymentId = withClarityCheck(async (deploymentId: string): Promise<void> => {
	window.clarity!("set", "deploymentId", deploymentId);
}, "setDeploymentId");

/**
 * Tracks custom event
 * @param eventName - Event name
 * @param properties - Event properties
 */
export const trackClarityEvent = withClarityCheck(
	async (eventName: string, properties?: Record<string, any>): Promise<void> => {
		window.clarity!("event", eventName, properties);
	},
	"trackEvent"
);

/**
 * Sets session ID
 * @param sessionId - Session ID
 */
export const setClaritySessionId = withClarityCheck(async (sessionId: string): Promise<void> => {
	window.clarity!("set", "sessionId", sessionId);
}, "setSessionId");

/**
 * Sets event ID
 * @param eventId - Event ID
 */
export const setClarityEventId = withClarityCheck(async (eventId: string): Promise<void> => {
	window.clarity!("set", "eventId", eventId);
}, "setEventId");
