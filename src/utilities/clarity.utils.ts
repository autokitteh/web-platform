import { Organization, Project, User } from "@src/types/models";

declare global {
	interface Window {
		clarity?: (action: string, ...args: any[]) => void;
	}
}

export const ClarityUtils = {
	setUser: (userId: string, userInfo: User) => {
		if (window.clarity) {
			window.clarity("set", "user", userId, userInfo);
		}
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
