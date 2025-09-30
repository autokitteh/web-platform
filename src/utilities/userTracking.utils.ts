import { Organization, Project } from "@src/types/models";
import { ClarityUtils } from "@utilities/clarity.utils";

export const UserTrackingUtils = {
	setUser: (userId: string, userName: string) => {
		ClarityUtils.setUser(userId, userName);
	},

	setOrg: (orgId: string, orgInfo: Organization) => {
		ClarityUtils.setOrg(orgId, orgInfo);
	},

	setProject: (projectId: string, projectInfo: Project) => {
		ClarityUtils.setProject(projectId, projectInfo);
	},

	setUserRole: (role: string) => {
		ClarityUtils.setUserRole(role);
	},

	setPlanType: (planType: string) => {
		ClarityUtils.setPlanType(planType);
	},

	setDeploymentId: (deploymentId: string) => {
		ClarityUtils.setDeploymentId(deploymentId);
	},

	trackEvent: (eventName: string, properties?: Record<string, any>) => {
		ClarityUtils.trackEvent(eventName, properties);
	},

	setSessionId: (sessionId: string) => {
		ClarityUtils.setSessionId(sessionId);
	},

	setEventId: (eventId: string) => {
		ClarityUtils.setEventId(eventId);
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
		ClarityUtils.setPageId(
			userId,
			userName,
			pageTitleKey,
			orgId,
			projectId,
			deploymentId,
			sessionId,
			eventId,
			connectionId,
			triggerId,
			filename
		);
	},
};
