/* eslint-disable no-console */
declare global {
	interface Window {
		clarity?: {
			(action: "identify", userId: string, sessionId: string, pageId: string, friendlyName: string): void;
			(action: "set", key: string, value: string, data?: any): void;
			(action: "event", eventName: string, properties?: Record<string, any>): void;
		};
	}
}

/**
 * Identifies user on login
 * @param userId - User ID
 * @param userName - User name
 * @param userEmail - User email
 */
export const setClarityUserOnLogin = async (userId: string, userName: string, userEmail: string): Promise<void> => {
	if (!window.clarity || !userId || !userName || !userEmail) {
		return;
	}

	try {
		window.clarity("identify", userId, "", "onLogin", `${userName}-${userEmail}`);
	} catch (error) {
		console.warn("Clarity setUserOnLogin failed:", error);
	}
};

/**
 * Sets page identification with detailed context
 * @param pageProps - Page properties for identification
 */
export const setClarityPageId = async (pageProps: {
	pageTitleKey: string;
	userEmail: string;
	userId: string;
	userName: string;
}): Promise<void> => {
	if (!window.clarity) {
		return;
	}

	try {
		const { userId, userName, userEmail, pageTitleKey } = pageProps;

		window.clarity("identify", userId, "", pageTitleKey, `${userName}-${userEmail}`);
	} catch (error) {
		console.warn("Clarity setPageId failed:", error);
	}
};

/**
 * Sets organization context
 * @param orgId - Organization ID
 * @param orgInfo - Organization information
 */
export const setClarityOrg = async (orgId: string): Promise<void> => {
	if (!window.clarity) {
		return;
	}

	try {
		window.clarity("set", "org", orgId);
	} catch (error) {
		console.warn("Clarity setOrg failed:", error);
	}
};

/**
 * Sets project context
 * @param projectId - Project ID
 * @param projectInfo - Project information
 */
export const setClarityProject = async (projectId: string): Promise<void> => {
	if (!window.clarity) {
		return;
	}

	try {
		window.clarity("set", "projectId", projectId);
		console.log("setProject", projectId);
	} catch (error) {
		console.warn("Clarity setProject failed:", error);
	}
};

/**
 * Sets user role
 * @param role - User role
 */
export const setClarityUserRole = async (role: string): Promise<void> => {
	if (!window.clarity) {
		return;
	}

	try {
		window.clarity("set", "userRole", role);
	} catch (error) {
		console.warn("Clarity setUserRole failed:", error);
	}
};

/**
 * Sets plan type
 * @param planType - Plan type
 */
export const setClarityPlanType = async (planType: string): Promise<void> => {
	if (!window.clarity) {
		return;
	}

	try {
		window.clarity("set", "planType", planType);
	} catch (error) {
		console.warn("Clarity setPlanType failed:", error);
	}
};

/**
 * Sets project name
 * @param projectName - Project name
 */
export const setClarityProjectName = async (projectName: string): Promise<void> => {
	if (!window.clarity) {
		return;
	}

	try {
		window.clarity("set", "projectName", projectName);
	} catch (error) {
		console.warn("Clarity setProjectName failed:", error);
	}
};

/**
 * Sets deployment ID
 * @param deploymentId - Deployment ID
 */
export const setClarityDeploymentId = async (deploymentId: string): Promise<void> => {
	if (!window.clarity) {
		return;
	}

	try {
		window.clarity("set", "deploymentId", deploymentId);
	} catch (error) {
		console.warn("Clarity setDeploymentId failed:", error);
	}
};

/**
 * Tracks custom event
 * @param eventName - Event name
 * @param properties - Event properties
 */
export const trackClarityEvent = async (eventName: string, properties?: Record<string, any>): Promise<void> => {
	if (!window.clarity) {
		return;
	}

	try {
		window.clarity("event", eventName, properties);
	} catch (error) {
		console.warn("Clarity trackEvent failed:", error);
	}
};

/**
 * Sets session ID
 * @param sessionId - Session ID
 */
export const setClaritySessionId = async (sessionId: string): Promise<void> => {
	if (!window.clarity) {
		return;
	}

	try {
		window.clarity("set", "sessionId", sessionId);
	} catch (error) {
		console.warn("Clarity setSessionId failed:", error);
	}
};

/**
 * Sets event ID
 * @param eventId - Event ID
 */
export const setClarityEventId = async (eventId: string): Promise<void> => {
	if (!window.clarity) {
		return;
	}

	try {
		window.clarity("set", "eventId", eventId);
	} catch (error) {
		console.warn("Clarity setEventId failed:", error);
	}
};
