import { Organization, Project } from "@src/types/models";

declare global {
	interface Window {
		clarity?: (action: string, ...args: any[]) => void;
	}
}

export const ClarityUtils = {
	setUserOnLogin: (userId: string, userName: string, userEmail: string) => {
		if (!window.clarity) {
			return;
		}

		window.clarity("identify", userId, "", "onLogin", `${userName}-${userEmail}`);
	},

	setPageId: ({
		userId,
		userName,
		userEmail,
		pageTitleKey,
		orgId,
		projectId,
		deploymentId,
		sessionId,
		eventId,
		connectionId,
		triggerId,
		filename,
		projectName,
		urlPath,
	}: {
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
		urlPath?: string;
		userEmail: string;
		userId: string;
		userName: string;
	}) => {
		if (!window.clarity) {
			return;
		}

		const pageIdParts = [
			pageTitleKey,
			`org:${orgId}`,
			projectId && `project:${projectId}`,
			projectName && `projectName:${projectName}`,
			deploymentId && `deployment:${deploymentId}`,
			sessionId && `session:${sessionId}`,
			eventId && `event:${eventId}`,
			connectionId && `connection:${connectionId}`,
			triggerId && `trigger:${triggerId}`,
			filename && `file:${filename}`,
			urlPath && `urlPath:${urlPath}`,
		].filter(Boolean);

		const formattedPageId = pageIdParts.join("|");

		window.clarity("identify", userId, "", formattedPageId, `${userName}-${userEmail}`);
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
