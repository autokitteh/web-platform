import { Organization, Project } from "@src/types/models";

declare global {
	interface Window {
		clarity?: (action: string, ...args: any[]) => void;
	}
}

export const ClarityUtils = {
	setUser: (userId: string, userName: string) => {
		if (!window.clarity) {
			return;
		}

		window.clarity("identify", userId, userName);
	},

	setPageId: (
		userId: string,
		userName: string,
		pageTitleKey: string,
		orgId: string,
		projectId?: string,
		deploymentId?: string,
		sessionId?: string,
		eventId?: string,
		connectionId?: string,
		triggerId?: string,
		filename?: string
	) => {
		if (!window.clarity) {
			return;
		}

		const pageIdParts = [
			pageTitleKey,
			`org:${orgId}`,
			projectId && `project:${projectId}`,
			deploymentId && `deployment:${deploymentId}`,
			sessionId && `session:${sessionId}`,
			eventId && `event:${eventId}`,
			connectionId && `connection:${connectionId}`,
			triggerId && `trigger:${triggerId}`,
			filename && `file:${filename}`,
		].filter(Boolean);

		const formattedPageId = pageIdParts.join("|");

		window.clarity("identify", userId, userName, formattedPageId);
	},

	setOrg: (orgId: string, orgInfo: Organization) => {
		if (window.clarity) {
			window.clarity("set", "org", orgId, orgInfo);
		}
	},

	setProject: (projectId: string, projectInfo: Project) => {
		if (window.clarity) {
			window.clarity("set", "project", projectId, projectInfo);
		}
	},

	setUserRole: (role: string) => {
		if (window.clarity) {
			window.clarity("set", "userRole", role);
		}
	},

	setPlanType: (planType: string) => {
		if (window.clarity) {
			window.clarity("set", "planType", planType);
		}
	},

	setDeploymentId: (deploymentId: string) => {
		if (window.clarity) {
			window.clarity("set", "deploymentId", deploymentId);
		}
	},

	trackEvent: (eventName: string, properties?: Record<string, any>) => {
		if (window.clarity) {
			window.clarity("event", eventName, properties);
		}
	},

	setSessionId: (sessionId: string) => {
		if (window.clarity) {
			window.clarity("set", "sessionId", sessionId);
		}
	},

	setEventId: (eventId: string) => {
		if (window.clarity) {
			window.clarity("set", "eventId", eventId);
		}
	},
};
