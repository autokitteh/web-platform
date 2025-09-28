import { datadogRum } from "@datadog/browser-rum";

import { Organization, Project, User } from "@src/types/models";

export const DatadogUtils = {
	setUser: (userId: string, userInfo: User) => {
		datadogRum.setUser({
			id: userId,
			email: userInfo.email,
			name: userInfo.name,
		});
		datadogRum.setGlobalContextProperty("user.id", userId);
		datadogRum.setGlobalContextProperty("user.email", userInfo.email);
		datadogRum.setGlobalContextProperty("user.name", userInfo.name);
	},

	setOrg: (orgId: string, orgInfo: Organization) => {
		datadogRum.setGlobalContextProperty("organization.id", orgId);
		datadogRum.setGlobalContextProperty("organization.name", orgInfo.displayName);
		datadogRum.setGlobalContextProperty("organization.uniqueName", orgInfo.uniqueName);
	},

	setProject: (projectId: string, projectInfo: Project) => {
		datadogRum.setGlobalContextProperty("project.id", projectId);
		datadogRum.setGlobalContextProperty("project.name", projectInfo.name);
		if (projectInfo.organizationId) {
			datadogRum.setGlobalContextProperty("project.organizationId", projectInfo.organizationId);
		}
	},

	setUserRole: (role: string) => {
		datadogRum.setGlobalContextProperty("user.role", role);
	},

	setPlanType: (planType: string) => {
		datadogRum.setGlobalContextProperty("billing.planType", planType);
	},

	setDeploymentId: (deploymentId: string) => {
		datadogRum.setGlobalContextProperty("deployment.id", deploymentId);
	},

	trackEvent: (eventName: string, properties?: Record<string, any>) => {
		datadogRum.addAction(eventName, properties);
	},

	setSessionId: (sessionId: string) => {
		datadogRum.setGlobalContextProperty("session.id", sessionId);
	},

	setEventId: (eventId: string) => {
		datadogRum.setGlobalContextProperty("event.id", eventId);
	},
};
