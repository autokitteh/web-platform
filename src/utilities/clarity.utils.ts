/* eslint-disable no-console */
import { Organization } from "@src/types/models";

declare global {
	interface Window {
		clarity?: {
			(action: "identify", userId: string, sessionId: string, pageId: string, friendlyName: string): void;
			(action: "set", key: string, value: string, data?: any): void;
			(action: "event", eventName: string, properties?: Record<string, any>): void;
		};
	}
}

export const ClarityUtils = {
	/**
	 * Identifies user on login
	 * @param userId - User ID
	 * @param userName - User name
	 * @param userEmail - User email
	 */
	setUserOnLogin: async (userId: string, userName: string, userEmail: string): Promise<void> => {
		if (!window.clarity || !userId || !userName || !userEmail) {
			return;
		}

		try {
			window.clarity("identify", userId, "", "onLogin", `${userName}-${userEmail}`);
		} catch (error) {
			console.warn("Clarity setUserOnLogin failed:", error);
		}
	},

	/**
	 * Sets page identification with detailed context
	 * @param pageProps - Page properties for identification
	 */
	setPageId: async (pageProps: {
		connectionId?: string;
		deploymentId?: string;
		eventId?: string;
		filename?: string;
		orgId: string;
		pageTitleKey: string;
		projectId?: string;
		projectName?: string;
		sessionId?: string;
		triggerId?: string;
		urlPath: string;
		userEmail: string;
		userId: string;
		userName: string;
	}): Promise<void> => {
		if (!window.clarity || !pageProps.userId || !pageProps.userName || !pageProps.userEmail) {
			return;
		}

		try {
			const pageIdParts = [
				pageProps.pageTitleKey,
				`org:${pageProps.orgId}`,
				pageProps.projectId && `project:${pageProps.projectId}`,
				pageProps.projectName && `projectName:${pageProps.projectName}`,
				pageProps.deploymentId && `deployment:${pageProps.deploymentId}`,
				pageProps.sessionId && `session:${pageProps.sessionId}`,
				pageProps.eventId && `event:${pageProps.eventId}`,
				pageProps.connectionId && `connection:${pageProps.connectionId}`,
				pageProps.triggerId && `trigger:${pageProps.triggerId}`,
				pageProps.filename && `file:${pageProps.filename}`,
				pageProps.urlPath && `urlPath:${pageProps.urlPath}`,
			].filter(Boolean);

			const formattedPageId = pageIdParts.join("|");

			window.clarity(
				"identify",
				pageProps.userId,
				"",
				formattedPageId,
				`${pageProps.userName}-${pageProps.userEmail}`
			);
		} catch (error) {
			console.warn("Clarity setPageId failed:", error);
		}
	},

	/**
	 * Sets organization context
	 * @param orgId - Organization ID
	 * @param orgInfo - Organization information
	 */
	setOrg: async (orgId: string, orgInfo: Organization): Promise<void> => {
		if (!window.clarity || !orgId) {
			return;
		}

		try {
			window.clarity(
				"set",
				"org",
				JSON.stringify({
					id: orgInfo.id,
					name: orgInfo.displayName,
				})
			);
		} catch (error) {
			console.warn("Clarity setOrg failed:", error);
		}
	},

	/**
	 * Sets project context
	 * @param projectId - Project ID
	 * @param projectInfo - Project information
	 */
	setProject: async (projectId: string): Promise<void> => {
		if (!window.clarity || !projectId) {
			return;
		}

		try {
			window.clarity("set", "projectId", projectId);
		} catch (error) {
			console.warn("Clarity setProject failed:", error);
		}
	},

	/**
	 * Sets user role
	 * @param role - User role
	 */
	setUserRole: async (role: string): Promise<void> => {
		if (!window.clarity || !role) {
			return;
		}

		try {
			window.clarity("set", "userRole", role);
		} catch (error) {
			console.warn("Clarity setUserRole failed:", error);
		}
	},

	/**
	 * Sets plan type
	 * @param planType - Plan type
	 */
	setPlanType: async (planType: string): Promise<void> => {
		if (!window.clarity || !planType) {
			return;
		}

		try {
			window.clarity("set", "planType", planType);
		} catch (error) {
			console.warn("Clarity setPlanType failed:", error);
		}
	},

	/**
	 * Sets deployment ID
	 * @param deploymentId - Deployment ID
	 */
	setDeploymentId: async (deploymentId: string): Promise<void> => {
		if (!window.clarity || !deploymentId) {
			return;
		}

		try {
			window.clarity("set", "deploymentId", deploymentId);
		} catch (error) {
			console.warn("Clarity setDeploymentId failed:", error);
		}
	},

	/**
	 * Tracks custom event
	 * @param eventName - Event name
	 * @param properties - Event properties
	 */
	trackEvent: async (eventName: string, properties?: Record<string, any>): Promise<void> => {
		if (!window.clarity || !eventName) {
			return;
		}

		try {
			window.clarity("event", eventName, properties);
		} catch (error) {
			console.warn("Clarity trackEvent failed:", error);
		}
	},

	/**
	 * Sets session ID
	 * @param sessionId - Session ID
	 */
	setSessionId: async (sessionId: string): Promise<void> => {
		if (!window.clarity || !sessionId) {
			return;
		}

		try {
			window.clarity("set", "sessionId", sessionId);
		} catch (error) {
			console.warn("Clarity setSessionId failed:", error);
		}
	},

	/**
	 * Sets event ID
	 * @param eventId - Event ID
	 */
	setEventId: async (eventId: string): Promise<void> => {
		if (!window.clarity || !eventId) {
			return;
		}

		try {
			window.clarity("set", "eventId", eventId);
		} catch (error) {
			console.warn("Clarity setEventId failed:", error);
		}
	},
};
